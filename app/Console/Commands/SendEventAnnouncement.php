<?php

namespace App\Console\Commands;

use App\Mail\NewEventAnnouncement;
use App\Models\MeetupEvent;
use App\Models\MeetupGroup;
use App\Models\Subscriber;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class SendEventAnnouncement extends Command
{
    protected $signature = "meetup:event-announcement";
    protected $description = "Send announcement emails for a new event to all subscribers";

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
            "Which event would you like to announce?",
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

        // Get the RSVP URL
        $rsvpUrl = url("/meetups/{$group->slug}/events/{$event->slug}");

        // Get test email address
        $testEmail = $this->ask(
            "Enter an email address to send a test email to (optional)",
        );

        if ($testEmail) {
            $this->info("Sending test email to {$testEmail}...");
            Mail::to($testEmail)->send(
                new NewEventAnnouncement($event, $group, $rsvpUrl),
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

        // Get subscribers
        $subscribers = Subscriber::where("meetup_group_id", $group->id)->get();

        if ($subscribers->isEmpty()) {
            $this->error("No subscribers found for this group");
            return 1;
        }

        // Show subscriber count and confirm
        $this->info("Found {$subscribers->count()} subscribers:");
        $this->table(
            ["Email"],
            $subscribers->map(fn($sub) => [$sub->email])->toArray(),
        );

        if (
            !$this->confirm(
                "Do you want to send the announcement to these subscribers?",
            )
        ) {
            $this->info("Operation cancelled.");
            return 0;
        }

        // Send emails
        $bar = $this->output->createProgressBar($subscribers->count());
        $bar->start();

        foreach ($subscribers as $subscriber) {
            Mail::to($subscriber->email)->send(
                new NewEventAnnouncement($event, $group, $rsvpUrl),
            );
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info(
            "{$subscribers->count()} Announcement emails have been sent successfully!",
        );

        return 0;
    }
}
