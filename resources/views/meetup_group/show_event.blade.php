@extends('layouts.app')

@section('title', $event->name . ' - ' . $group->name)

@section('content')
<link href="/css/meetup_group/show_event.css" rel="stylesheet">

<h1>{{ $group->name }}</h1>
<h2>{{ $event->name }}</h2>
<p>Places available: {{ $event->remainingPlaces() }} out of {{ $event->max_attendance }} maximum</p>
<p>{{ $event->description }}</p>
@if (session('message'))
    <div class="alert alert-success">
        {{ session('message') }}
    </div>
@endif

@if ($event->remainingPlaces() > 0)
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
