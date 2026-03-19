<?php

namespace App\Mail;

use App\Models\MeetupEvent;
use App\Models\MeetupGroup;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EventBump extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public MeetupEvent $event,
        public MeetupGroup $group,
        public string $rsvpUrl,
        public string $customMessage,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Reminder: {$this->event->name} ({$this->group->name})"
        );
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.event_bump');
    }

    public function attachments(): array
    {
        return [];
    }
}
