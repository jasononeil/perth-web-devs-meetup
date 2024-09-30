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

        RSVP::create([
            "meetup_event_id" => $event->id,
            "name" => $request->name,
            "email" => $request->email,
            "mobile_number" => $request->mobile_number,
        ]);

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
            );
    }
}
