<?php

namespace App\Console\Commands;

use App\Mail\EventBump;
use App\Models\MeetupEvent;
use App\Models\MeetupEventMailLog;
use App\Models\MeetupEventMessage;
use App\Models\MeetupGroup;
use App\Models\RSVP;
use App\Models\Subscriber;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Process;

class SendEventBump extends Command
{
    protected $signature = "meetup:event-bump";
    protected $description = "Send bump emails to subscribers who haven't RSVP'd yet";

    public function handle()
    {
        // Get available groups
        $groups = MeetupGroup::all();
        if ($groups->isEmpty()) {
            $this->error("No meetup groups found");
            return 1;
        }

        // Choose a group
        $group = $this->choice(
            "Which group is the event for?",
            $groups->pluck("name")->toArray(),
            0,
        );
        $group = $groups->where("name", $group)->first();

        // Get upcoming events for the group
        $upcomingEvents = MeetupEvent::where("meetup_group_id", $group->id)
            ->where("start_time", ">=", Carbon::now())
            ->orderBy("start_time")
            ->get();

        if ($upcomingEvents->isEmpty()) {
            $this->error("No upcoming events found for this group");
            return 1;
        }

        // Choose an event
        $event = $this->choice(
            "Which event would you like to send bump emails for?",
            $upcomingEvents
                ->map(
                    fn($event) => "{$event->name} ({$event->formattedDate()})",
                )
                ->toArray(),
            0,
        );
        $event = $upcomingEvents
            ->filter(fn($e) => "{$e->name} ({$e->formattedDate()})" === $event)
            ->first();

        // Get subscribers who haven't RSVP'd (only verified)
        $rsvpEmails = RSVP::where("meetup_event_id", $event->id)
            ->verified()
            ->pluck("email")
            ->toArray();

        $subscribers = Subscriber::where("meetup_group_id", $group->id)
            ->verified()
            ->whereNotIn("email", $rsvpEmails)
            ->get();

        if ($subscribers->isEmpty()) {
            $this->info(
                "No subscribers need bump emails - everyone has already RSVP'd!",
            );
            return 0;
        }

        // Launch editor for custom message
        $tempFile = tempnam(sys_get_temp_dir(), "meetup-bump-message");
        $this->info("Opening editor for custom bump message...");
        $editor = getenv("EDITOR") ?: "vim";
        Process::forever()->tty()->run(sprintf("%s %s", $editor, $tempFile));
        $customMessage = trim(file_get_contents($tempFile));
        unlink($tempFile);

        if (empty($customMessage)) {
            $this->error("Custom message is required for bump emails");
            return 1;
        }

        // Get the RSVP URL
        $rsvpUrl = url("/meetups/{$group->slug}/events/{$event->slug}");

        // Get test email address
        $testEmail = $this->ask(
            "Enter an email address to send a test email to (optional)",
        );

        if ($testEmail) {
            $this->info("Sending test email to {$testEmail}...");
            Mail::to($testEmail)->send(
                new EventBump($event, $group, $rsvpUrl, $customMessage),
            );

            if (
                !$this->confirm(
                    "Did the test email look good? Would you like to proceed?",
                )
            ) {
                $this->info("Operation cancelled.");
                return 0;
            }
        }

        // Show subscriber count and confirm
        $this->info(
            "Found {$subscribers->count()} subscribers who need bump emails:",
        );
        $this->table(
            ["Email"],
            $subscribers->map(fn($sub) => [$sub->email])->toArray(),
        );

        if (
            !$this->confirm(
                "Do you want to send the bump message to these subscribers?",
            )
        ) {
            $this->info("Operation cancelled.");
            return 0;
        }

        // Create the message record
        $messageRecord = MeetupEventMessage::create([
            "meetup_event_id" => $event->id,
            "message_type" => "bump",
            "custom_message" => $customMessage,
        ]);

        // Send emails and log each one
        $bar = $this->output->createProgressBar($subscribers->count());
        $bar->start();

        foreach ($subscribers as $subscriber) {
            Mail::to($subscriber->email)->send(
                new EventBump($event, $group, $rsvpUrl, $customMessage),
            );

            // Log the email send
            MeetupEventMailLog::create([
                "meetup_event_message_id" => $messageRecord->id,
                "recipient_email" => $subscriber->email,
                "sent_at" => Carbon::now(),
            ]);

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info(
            "{$subscribers->count()} Bump emails have been sent successfully!",
        );

        return 0;
    }
}
