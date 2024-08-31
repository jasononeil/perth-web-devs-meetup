<h1>{{ $group->name }}</h1>
<p>{{ $group->description }}</p>

<h2>Events</h2>
<ul>
    @foreach ($group->meetupEvents as $event)
        <li>
            {{ $event->name }} - {{ $event->start_time }}
            @if ($event->remainingPlaces() > 0)
                Remaining places: {{ $event->remainingPlaces() }}
            @else
                Event is fully booked - join waitlist
            @endif
        </li>
    @endforeach
</ul>
