<link href="{{ mix('resources/css/app.css') }}" rel="stylesheet">

<h1>{{ $group->name }}</h1>
<p>{{ $group->description }}</p>

<h2>Events</h2>
<ul>
    @foreach ($group->meetupEvents as $event)
        <li>
            <a href="{{ url("/meetups/{$group->slug}/events/{$event->slug}") }}">{{ $event->name }} - {{ $event->start_time }}</a>
            @if ($event->remainingPlaces() > 0)
                Remaining places: {{ $event->remainingPlaces() }}
            @else
                Event is fully booked - join waitlist
            @endif
        </li>
    @endforeach
</ul>
