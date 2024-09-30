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
            ->with("meetupEvents")
            ->first();

        if (!$group) {
            abort(404);
        }

        return view("meetup_group.show", ["group" => $group]);
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
            "name" => "required",
            "email" => "nullable|email|required_without:mobile_number",
            "mobile_number" => "nullable|required_without:email",
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
                "Thanks for subscribing! We'll send you an email when we announce or next event."
            )
            ->with("subscribe_success", true);
    }
}
