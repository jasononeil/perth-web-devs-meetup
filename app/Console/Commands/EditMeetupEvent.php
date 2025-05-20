<?php

namespace App\Console\Commands;

use App\Models\MeetupEvent;
use App\Models\Person;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class EditMeetupEvent extends Command
{
    protected $signature = 'meetup:edit-event';
    protected $description = 'Edit an existing meetup event';

    public function handle()
    {
        $events = MeetupEvent::with(['hosts'])->get();
        if ($events->isEmpty()) {
            $this->error('No events found to edit.');
            return 1;
        }

        // Select event to edit
        $eventChoices = $events->pluck('name', 'id')->toArray();
        $eventChoice = $this->choice(
            'Select event to edit:',
            $eventChoices
        );
        $eventId = array_search($eventChoice, $eventChoices);
        $event = MeetupEvent::with(['hosts'])->find($eventId);

        // Edit basic details
        $name = $this->ask('Event name:', $event->name);
        $event->name = $name;
        $event->slug = Str::slug($name);

        $event->description = $this->ask('Event description:', $event->description);
        $event->location = $this->ask('Event location:', $event->location);

        // Date and time
        $startTime = Carbon::parse($event->start_time);
        $endTime = Carbon::parse($event->end_time);

        $date = $this->ask('Event date (YYYY-MM-DD):', $startTime->format('Y-m-d'));
        $newStartTime = $this->ask('Start time (HH:MM):', $startTime->format('H:i'));
        $newEndTime = $this->ask('End time (HH:MM):', $endTime->format('H:i'));

        $event->start_time = Carbon::parse("$date $newStartTime");
        $event->end_time = Carbon::parse("$date $newEndTime");

        $event->max_attendance = $this->ask('Maximum number of attendees:', $event->max_attendance);
        $event->accepting_rsvps = $this->confirm('Accept RSVPs?', $event->accepting_rsvps);

        // Edit hosts
        if ($this->confirm('Would you like to modify the event hosts?', false)) {
            $people = Person::all();
            if ($people->isNotEmpty()) {
                $hostChoices = $people->pluck('name', 'id')->toArray();
                $hostChoices['0'] = 'Done adding hosts';
                
                $currentHosts = $event->hosts->pluck('id')->toArray();
                $selectedHosts = $currentHosts;

                $this->info('Current hosts: ' . $event->hosts->pluck('name')->implode(', '));
                $this->info('Select hosts for the event (choose "Done adding hosts" when finished):');
                
                while (true) {
                    $hostChoice = $this->choice(
                        'Select a host:',
                        $hostChoices
                    );
                    
                    if ($hostChoice === 'Done adding hosts') {
                        break;
                    }
                    
                    $hostId = array_search($hostChoice, $hostChoices);
                    if (!in_array($hostId, $selectedHosts)) {
                        $selectedHosts[] = $hostId;
                        $this->info("Added {$hostChoice} as a host");
                    }
                }
                
                // Sync the hosts
                $event->hosts()->sync($selectedHosts);
            } else {
                $this->warn('No people available to select as hosts. Add people to the database first.');
            }
        }

        $event->save();

        $this->info('Event updated successfully!');
        $this->table(
            ['Field', 'Value'],
            [
                ['Name', $event->name],
                ['Slug', $event->slug],
                ['Date', $event->formattedDate()],
                ['Time', $event->formattedTime()],
                ['Location', $event->location],
                ['Max Attendance', $event->max_attendance],
                ['Accepting RSVPs', $event->accepting_rsvps ? 'Yes' : 'No'],
            ]
        );

        return 0;
    }
}