<?php

namespace App\Console\Commands;

use App\Mail\EventReminder;
use App\Models\MeetupEvent;
use App\Models\MeetupEventMailLog;
use App\Models\MeetupEventMessage;
use App\Models\RSVP;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendEventReminder extends Command
{
    protected $signature = 'meetup:event-reminder';

    protected $description = "Send reminder emails to RSVP'd attendees 48 hours before events";

    public function handle()
    {
        // Find events happening between now and 48 hours from now (in app timezone)
        $now = Carbon::now(config('app.timezone'));
        $endDate = $now->copy()->addHours(48);
        $this->info(
            "Searching {$now->format('Y-m-d H:i:s')} to {$endDate->format(
                'Y-m-d H:i:s',
            )} (app timezone)",
        );

        // Convert to strings for SQLite comparison (since DB stores as local time)
        $events = MeetupEvent::whereBetween('start_time', [
            $now->format('Y-m-d H:i:s'),
            $endDate->format('Y-m-d H:i:s'),
        ])->get();

        if ($events->isEmpty()) {
            $this->info('No events found happening in the next 48 hours.');

            return 0;
        }

        foreach ($events as $event) {
            $this->info(
                "Processing event: {$event->name} ({$event->formattedDate()})",
            );

            // Check if reminders have already been sent for this event
            $existingReminder = MeetupEventMessage::where(
                'meetup_event_id',
                $event->id,
            )
                ->where('message_type', 'reminder')
                ->first();

            if ($existingReminder) {
                $this->info(
                    '  → Reminders already sent for this event, skipping.',
                );

                continue;
            }

            // Get verified RSVPs for this event
            $rsvps = RSVP::where('meetup_event_id', $event->id)
                ->confirmed()
                ->get();

            if ($rsvps->isEmpty()) {
                $this->info('  → No RSVPs found for this event, skipping.');

                continue;
            }

            $group = $event->meetupGroup;
            $eventUrl = url("/meetups/{$group->slug}/events/{$event->slug}");

            // Create the message record
            $messageRecord = MeetupEventMessage::create([
                'meetup_event_id' => $event->id,
                'message_type' => 'reminder',
                'custom_message' => null,
            ]);

            // Send reminders to all RSVP'd attendees
            $sentCount = 0;
            foreach ($rsvps as $rsvp) {
                try {
                    Mail::to($rsvp->email)->send(
                        new EventReminder($event, $group, $eventUrl),
                    );

                    // Log the email send
                    MeetupEventMailLog::create([
                        'meetup_event_message_id' => $messageRecord->id,
                        'recipient_email' => $rsvp->email,
                        'sent_at' => Carbon::now(),
                    ]);

                    $sentCount++;
                } catch (\Exception $e) {
                    $this->error(
                        "  → Failed to send reminder to {$rsvp->email}: {$e->getMessage()}",
                    );
                }
            }

            $this->info("  → Sent {$sentCount} reminder emails");
        }

        return 0;
    }
}
