@extends('layouts.app')

@section('title', $group->name)

@push('styles')
    <link href="/css/cards.css" rel="stylesheet">
    <link href="/css/event_details.css" rel="stylesheet">
    <link href="/css/avatar_list.css" rel="stylesheet">
    <link href="/css/meetup_group/show.css" rel="stylesheet">
@endpush

@section('content')

<main id="meetup-group-show">
    <h1>{{ $group->name }}</h1>
    <section class="lede-text">{!! \Michelf\Markdown::defaultTransform($group->description) !!}</section>

    <h2>Upcoming Events</h2>
    <ul class="cards">
        @forelse ($upcomingEvents as $event)
            <li class="event">
                <h3 class="card-title">
                    <a href="{{ url("/meetups/{$group->slug}/events/{$event->slug}") }}">
                        {{ $event->name }}
                    </a>
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
        @empty
            <li class="no-events">
                <p>No upcoming events scheduled at the moment.</p>
            </li>
        @endforelse
        <li class="subscribe">
            <h3 class="card-title">Subscribe</h3>
            <section class="card-body">
                @if (session('message'))
                    <div class="alert {{ session('subscribe_pending') ? 'alert-info' : 'alert-success' }}">
                        {{ session('message') }}
                    </div>
                @endif
                @if ($errors->any())
                    <div class="alert alert-danger">
                        <ul>
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif
                @if (!session('subscribe_success') && !session('subscribe_pending'))
                    <p>Be the first to know about new events we're hosting.</p>
                    <form method="POST" action="{{ route('subscribe', ['groupSlug' => $group->slug]) }}">
                        @csrf
                        <input type="hidden" name="_rendered_at" value="{{ time() }}">
                        <div style="position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important; overflow: hidden !important; clip: rect(0,0,0,0) !important; white-space: nowrap !important; border: 0 !important;">
                            <label for="website">Please leave this field empty. Apologies to those using screen readers, we use this as a honeypot field to catch bots without resorting to Captchas.</label>
                            <input type="text" name="website" id="website" tabindex="-1" autocomplete="off">
                        </div>
                        <div class="app-form-group">
                            <label for="email">Email</label>
                            <input type="email" class="app-form-control" id="email" name="email" required>
                        </div>
                        <button type="submit" class="app-btn">Subscribe</button>
                    </form>
                @endif
            </section>
        </li>
    </ul>

    @if($archivedEvents->count() > 0)
        <h2>Past Events</h2>
        <ul class="cards archived-events">
            @foreach ($archivedEvents as $event)
                <li class="event archived">
                    <h3 class="card-title">
                        <a href="{{ url("/meetups/{$group->slug}/events/{$event->slug}") }}">
                            {{ $event->name }}
                        </a>
                    </h3>

                    <dl class="event-details card-body">
                        <dt>Date:</dt>
                        <dd>{{ $event->formattedDate() }}</dd>
                        <dt>Time:</dt>
                        <dd>{{ $event->formattedTime() }}</dd>
                        <dt>Location:</dt>
                        <dd>{{ $event->location }}</dd>
                        <dt>Attendees:</dt>
                        <dd>{{ $event->rsvps()->confirmed()->count() }} people attended</dd>
                    </dl>
                </li>
            @endforeach
        </ul>
    @endif

    <h3>Organiser</h3>
    <ul class="avatar-list">
        @foreach ($group->organisers as $organiser)
            <li>
                <figure>
                    <img src="{{ $organiser->profile_image_url }}" alt="{{ $organiser->name }}">
                    <figcaption>{{ $organiser->name }}</figcaption>
                </figure>
            </li>
        @endforeach
    </ul>
</main>

@endsection
