@extends('layouts.app')

@section('title', $event->name . ' - ' . $group->name)

@push('styles')
    <link href="/css/meetup_group/show_event.css" rel="stylesheet">
    <link href="/css/event_details.css" rel="stylesheet">
@endpush

@section('content')
<h1>{{ $group->name }}</h1>
<a href="{{ route('showGroup', ['groupSlug' => $group->slug]) }}">⇠ Back to all events for this group</a>
<h2>{{ $event->name }}</h2>
<p>{{ $event->description }}</p>

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
    <form method="POST" action="{{ route('rsvp', ['groupSlug' => $group->slug, 'eventSlug' => $event->slug]) }}">
        <h3>RSVP here</h3>
        @csrf
        @if (session('message'))
            <div class="alert alert-success">
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
        <div class="form-group">
            <label for="name">Name</label>
            <input type="text" class="form-control" id="name" name="name" required>
        </div>
        <div class="form-group">
            <label for="email">Email</label>
            <input type="email" class="form-control" id="email" name="email">
        </div>
        <button type="submit" class="btn btn-primary">RSVP</button>
    </form>
@else
    Event is fully booked - join waitlist
@endif
@endsection
