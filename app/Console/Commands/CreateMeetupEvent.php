<?php

namespace App\Console\Commands;

use App\Models\MeetupEvent;
use App\Models\MeetupGroup;
use App\Models\Person;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Str;

class CreateMeetupEvent extends Command
{
    protected $signature = 'meetup:create-event';

    protected $description = 'Create a new meetup event interactively';

    public function handle()
    {
        // Get or create meetup group
        $groups = MeetupGroup::all();
        if ($groups->isEmpty()) {
            $this->error(
                'No meetup groups found. Please create a meetup group first.'
            );

            return 1;
        }

        $groupChoices = $groups->pluck('name', 'id')->toArray();
        $meetupGroupId = $this->choice('Select meetup group:', $groupChoices);
        $meetupGroupId = array_search($meetupGroupId, $groupChoices);

        // Collect event details
        $name = $this->ask('Event name:');
        $slug = Str::slug($name);

        // Launch editor for description
        $tempFile = tempnam(sys_get_temp_dir(), 'meetup-description');
        $this->info('Opening editor for event description...');
        $editor = getenv('EDITOR') ?: 'vim';
        Process::forever()->tty()->run(sprintf('%s %s', $editor, $tempFile));
        $description = trim(file_get_contents($tempFile));
        unlink($tempFile);

        $location = $this->ask('Event location:');

        // Date and time
        $date = $this->ask('Event date (YYYY-MM-DD):');
        $startTime = $this->ask('Start time (HH:MM):');
        $endTime = $this->ask('End time (HH:MM):');

        $startDateTime = Carbon::parse("$date $startTime");
        $endDateTime = Carbon::parse("$date $endTime");

        $maxAttendance = $this->ask('Maximum number of attendees:', 50);
        $acceptingRsvps = $this->confirm('Accept RSVPs?', true);

        // Create the event
        $event = new MeetupEvent([
            'meetup_group_id' => $meetupGroupId,
            'name' => $name,
            'slug' => $slug,
            'description' => $description,
            'location' => $location,
            'start_time' => $startDateTime,
            'end_time' => $endDateTime,
            'max_attendance' => $maxAttendance,
            'accepting_rsvps' => $acceptingRsvps,
        ]);

        $event->save();

        // Handle host selection
        $people = Person::all();
        if ($people->isNotEmpty()) {
            $hostChoices = $people->pluck('name', 'id')->toArray();
            $hostChoices['0'] = 'Done adding hosts';

            $this->info(
                'Select hosts for the event (choose "Done adding hosts" when finished):'
            );
            $selectedHosts = [];

            while (true) {
                $hostChoice = $this->choice('Select a host:', $hostChoices);

                if ($hostChoice === 'Done adding hosts') {
                    break;
                }

                $hostId = array_search($hostChoice, $hostChoices);
                if (! in_array($hostId, $selectedHosts)) {
                    $selectedHosts[] = $hostId;
                    $this->info("Added {$hostChoice} as a host");
                }
            }

            if (! empty($selectedHosts)) {
                $event->hosts()->attach($selectedHosts);
            }
        } else {
            $this->warn(
                'No people available to select as hosts. Add people to the database first.'
            );
        }

        $this->info('Event created successfully!');
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
