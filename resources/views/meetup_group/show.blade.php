<h1>{{ $group->name }}</h1>
<p>{{ $group->description }}</p>

<h2>Events</h2>
<ul>
    @foreach ($group->meetupEvents as $event)
        <li>{{ $event->name }} - {{ $event->date }}</li>
    @endforeach
</ul>
