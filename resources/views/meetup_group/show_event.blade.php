<h1>{{ $group->name }}</h1>
<h2>{{ $event->name }}</h2>
<p>{{ $event->description }}</p>

@if ($event->remainingPlaces() > 0)
    Remaining places: {{ $event->remainingPlaces() }}
@else
    Event is fully booked - join waitlist
@endif
