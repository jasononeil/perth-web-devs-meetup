<?php

namespace App\Mail;

use App\Models\MeetupEvent;
use App\Models\MeetupGroup;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewEventAnnouncement extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public MeetupEvent $event,
        public MeetupGroup $group,
        public string $rsvpUrl,
    ) {
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(
                "jason@jasononeil.au",
                "Jason O'Neil (Perth Web Devs meetup)"
            ),
            subject: "Upcoming Event: {$this->event->name} ({$this->group->name})"
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(markdown: "emails.new_event_announcement");
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
