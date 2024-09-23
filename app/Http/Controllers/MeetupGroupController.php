<?php

namespace App\Http\Controllers;

use App\Models\MeetupGroup;
use Illuminate\Http\Request;

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
}
