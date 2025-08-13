<x-mail::message>
# {{ $event->name }}

{{ $customMessage }}

## Event Details

- **What**: {{ $event->name }}
- **When**: {{ $event->formattedDate() }} at {{ $event->formattedTime() }}
- **Where**: {{ $event->location }}

{{ $event->description }}

<x-mail::button :url="$rsvpUrl">
RSVP Now
</x-mail::button>

We'd love to see you there!

Thanks,<br>
@if($event->hosts->count() > 0)
{{ $event->hosts->pluck('name')->implode(', ') }}<br>
@endif
{{ $group->name }}
</x-mail::message>