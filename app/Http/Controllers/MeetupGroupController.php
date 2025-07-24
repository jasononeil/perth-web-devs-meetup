<?php

namespace App\Http\Controllers;

use App\Models\MeetupGroup;
use App\Models\RSVP;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\RsvpConfirmation;

class MeetupGroupController extends Controller
{
    public function show($groupSlug)
    {
        $group = MeetupGroup::where("slug", $groupSlug)
            ->with(['meetupEvents' => function($query) {
                $query->orderBy('start_time', 'desc');
            }])
            ->first();

        if (!$group) {
            abort(404);
        }

        // Separate upcoming and archived events
        $upcomingEvents = $group->meetupEvents->filter(function($event) {
            return !$event->isArchived();
        });

        $archivedEvents = $group->meetupEvents->filter(function($event) {
            return $event->isArchived();
        });

        return view("meetup_group.show", [
            "group" => $group,
            "upcomingEvents" => $upcomingEvents,
            "archivedEvents" => $archivedEvents
        ]);
    }

    public function showEvent($groupSlug, $eventSlug)
    {
        $group = MeetupGroup::where("slug", $groupSlug)->firstOrFail();
        $event = $group
            ->meetupEvents()
            ->where("slug", $eventSlug)
            ->firstOrFail();
        return view("meetup_group.show_event", compact("group", "event"));
    }

    public function rsvp(Request $request, $groupSlug, $eventSlug)
    {
        $group = MeetupGroup::where("slug", $groupSlug)->firstOrFail();
        $event = $group
            ->meetupEvents()
            ->where("slug", $eventSlug)
            ->firstOrFail();

        $request->validate([
            "name" => "required|not_regex:/http/i",
            "email" => "nullable|email|required_without:mobile_number",
            "mobile_number" => "nullable|required_without:email",
        ], [
            "name.not_regex" => "We don't allow any submissions if your name contains the substring `http`. Sorry if you validly have this as your name!"
        ]);

        RSVP::updateOrCreate(
            [
                "meetup_event_id" => $event->id,
                "email" => $request->email,
                "mobile_number" => $request->mobile_number,
            ],
            [
                "name" => $request->name,
            ]
        );

        if ($request->has("subscribe")) {
            $group->subscribers()->firstOrCreate([
                "email" => $request->email,
            ]);
        }

        if ($request->email) {
            Mail::to($request->email)->send(
                new RsvpConfirmation($request->name, $event, $group)
            );
        }

        return redirect()
            ->route("showEvent", [
                "groupSlug" => $groupSlug,
                "eventSlug" => $eventSlug,
            ])
            ->with(
                "message",
                "Thank you for your RSVP! We're excited to see you there."
            )
            ->with("rsvp_success", true);
    }

    public function subscribe(Request $request, $groupSlug)
    {
        $group = MeetupGroup::where("slug", $groupSlug)->firstOrFail();

        // Honeypot check - if the bot filled out the hidden field, silently redirect
        if ($request->filled('website')) {
            return redirect()->route("showGroup", ["groupSlug" => $groupSlug]);
        }

        // Time check - form submissions faster than 2 seconds are likely bots
        $formRenderedAt = $request->input('_rendered_at');
        if ($formRenderedAt && (time() - intval($formRenderedAt) < 2)) {
            return redirect()->route("showGroup", ["groupSlug" => $groupSlug]);
        }

        $request->validate([
            "email" => "required|email",
        ]);

        $group->subscribers()->firstOrCreate([
            "email" => $request->email,
        ]);

        return redirect()
            ->route("showGroup", ["groupSlug" => $groupSlug])
            ->with(
                "message",
                "Thanks for subscribing! We'll send you an email when we announce our next event."
            )
            ->with("subscribe_success", true);
    }
}
