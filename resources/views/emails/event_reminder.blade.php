<x-mail::message>
# See you {{ $event->dayOfWeek() }}: {{ $event->name }}

Not long now! We're excited you're coming and look forward to seeing you there.

## Event Details

- **What**: {{ $event->name }}
- **When**: {{ $event->formattedDate() }} at {{ $event->formattedTime() }}
- **Where**: {{ $event->location }}

{{ $event->description }}

<x-mail::button :url="$eventUrl">
View Event Details
</x-mail::button>

Thanks,<br>
@if($event->hosts->count() > 0)
{{ $event->hosts->pluck('name')->implode(', ') }}<br>
@endif
{{ $group->name }}
</x-mail::message>
