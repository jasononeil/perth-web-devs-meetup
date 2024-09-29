<x-mail::message>
# Confirmation

Dear {{ $name }},

Thank you for your RSVP to the {{ $event->name }} event of the {{ $group->name }} group.

The event will be held on {{ $event->date }} at {{ $event->location }}.

We're excited to see you there!

If you need to change your RSVP, or have questions, just reply to this email and let me know. (I haven't automated any of that yet).

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
