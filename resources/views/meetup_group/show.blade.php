@extends('layouts.app')

@section('title', $group->name)

@push('styles')
    <link href="/css/cards.css" rel="stylesheet">
    <link href="/css/event_details.css" rel="stylesheet">
    <link href="/css/meetup_group/show.css" rel="stylesheet">
@endpush

@section('content')

<main id="meetup-group-show">
    <h1>{{ $group->name }}</h1>
    <section class="lede-text">{!! \Michelf\Markdown::defaultTransform($group->description) !!}</section>

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
        <li class="subscribe">
            <h3 class="card-title">Subscribe</h3>
            <section class="card-body">
                <p>Be the first to know about new events we're hosting.</p>
                <form method="POST">
                    <!-- route('subscribe', ['groupSlug' => $group->slug]) " -->
                    @csrf
                    <div class="app-form-group">
                        <label for="email">Email</label>
                        <input type="email" class="app-form-control" id="email" name="email" required>
                    </div>
                    <button type="submit" class="app-btn">Subscribe</button>
                </form>
            </section>
        </li>
    </ul>
</main>

@endsection
