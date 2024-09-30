@extends('layouts.app')

@section('title', $event->name . ' - ' . $group->name)

@push('styles')
    <link href="/css/meetup_group/show_event.css" rel="stylesheet">
    <link href="/css/event_details.css" rel="stylesheet">
@endpush

@section('content')
<h1>{{ $group->name }}</h1>
<a href="{{ route('showGroup', ['groupSlug' => $group->slug]) }}" class="back-link">⇠ Back to all events for this group</a>

<div class="event-grid">
    <section>
        <h2>{{ $event->name }}</h2>
        <div class="lede-text">{!! \Michelf\Markdown::defaultTransform($event->description) !!}</div>
    </section>
    <section>
        <h3>Details</h3>
        <dl class="event-details">
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

        @if ($event->remainingPlaces() > 0)
            <h3>RSVP here</h3>
            @if (session('message'))
                <div class="alert alert-success">
                    {{ session('message') }}
                </div>
            @endif
            @if (!session('rsvp_success'))
                <form method="POST" action="{{ route('rsvp', ['groupSlug' => $group->slug, 'eventSlug' => $event->slug]) }}">
                    @csrf
                    @if ($errors->any())
                        <div class="alert alert-danger">
                            <ul>
                                @foreach ($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    @endif
                    <div class="app-form-group">
                        <label for="name">Name</label>
                        <input type="text" class="app-form-control" id="name" name="name" required>
                    </div>
                    <div class="app-form-group">
                        <label for="email">Email</label>
                        <input type="email" class="app-form-control" id="email" name="email">
                    </div>

                    <div class="app-form-group">
                        <label for="subscribe">Email me about future events</label>
                        <input type="checkbox" id="subscribe" name="subscribe">
                    </div>

                    <button type="submit" class="app-btn">RSVP</button>
                </form>
            @endif
        @else
            <p>Event is fully booked - join waitlist</p>
        @endif
    </section>
</div>
@endsection
