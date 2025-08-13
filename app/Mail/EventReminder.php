<?php

namespace App\Mail;

use App\Models\MeetupEvent;
use App\Models\MeetupGroup;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EventReminder extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public MeetupEvent $event,
        public MeetupGroup $group,
        public string $eventUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "{$this->event->date->format(
                "l",
            )}: {$this->event->name} ({$this->group->name})",
        );
    }

    public function content(): Content
    {
        return new Content(markdown: "emails.event_reminder");
    }

    public function attachments(): array
    {
        return [];
    }
}
