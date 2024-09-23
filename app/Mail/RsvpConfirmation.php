<?php

namespace App\Mail;

use App\Models\RSVP;
use App\Models\MeetupEvent;
use App\Models\MeetupGroup;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RsvpConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public string $name,
        public MeetupEvent $event,
        public MeetupGroup $group
    ) {
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        from:
        new Address(
            "jason@jasononeil.au",
            "Jason O'Neil (Perth Web Devs meetup)"
        );
        return new Envelope(
            subject: "RSVP Confirmed: {$this->event->name} ({$this->group->name})"
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(markdown: "emails.rsvp_confirmation");
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
