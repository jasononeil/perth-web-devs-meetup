<x-mail::message>
# Confirmation

Dear {{ $name }},

Thank you for your RSVP to the {{ $event->name }} event of the {{ $group->name }} group.

The event will be held on {{ $event->date }} at {{ $event->location }}.

We're excited to see you there!

<x-mail::button :url="''">
Change RSVP (TODO: Add link)
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
