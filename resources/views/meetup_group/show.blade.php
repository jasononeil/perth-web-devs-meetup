@extends('layouts.app')

@section('title', $group->name)

@section('content')
<link href="/css/app.css" rel="stylesheet">
<link href="/css/cards.css" rel="stylesheet">
<link href="/css/meetup_group/show.css" rel="stylesheet">

<main id="meetup-group-show">
    <h1>{{ $group->name }}</h1>
    <p>{{ $group->description }}</p>

    <h2>Events</h2>
    <ul class="cards">
        @foreach ($group->meetupEvents as $event)
            <li class="event">
                <h3 class="card-title">
                    <a href="{{ url("/meetups/{$group->slug}/events/{$event->slug}") }}">{{ $event->name }}</a>
                </h3>

                <dl class="event-details card-body">
                    <dt>Date:</dt>
                    <dd>{{ $event->formattedDate() }}</dd>
                    <dt>Time:</dt>
                    <dd>{{ $event->formattedTime() }}</dd>
                    <dt>Location:</dt>
                    <dd>{{ $event->location }}</dd>
                    <dt>Spaces available:</dt>
                    <dd>
                        {{$event->max_attendance}}
                        @if ($event->remainingPlaces() > 0)
                            ({{ $event->remainingPlaces() }} remaining)
                        @else
                            (Fully booked)
                        @endif
                    </dd>
                </dl>
            </li>
        @endforeach
        <li>
            <h3 class="card-title">Subscribe to hear about new events</h3>
            <form method="POST" class="card-body">
                <!-- route('subscribe', ['groupSlug' => $group->slug]) " -->
                @csrf
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" class="form-control" id="email" name="email" required>
                </div>
                <button type="submit" class="btn btn-primary">Subscribe</button>
        </li>
    </ul>
</main>

@endsection
