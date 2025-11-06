<?php

namespace App\Http\Controllers;

use App\Models\MeetupGroup;
use App\Models\MeetupEvent;
use App\Models\RSVP;
use App\Models\Person;
use App\Models\Subscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\RsvpConfirmation;

class MeetupGroupController extends Controller
{
    public function show($groupSlug)
    {
        $group = MeetupGroup::where("slug", $groupSlug)
            ->with([
                "meetupEvents" => function ($query) {
                    $query->orderBy("start_time", "desc");
                },
            ])
            ->first();

        if (!$group) {
            abort(404);
        }

        // Separate upcoming and archived events
        $upcomingEvents = $group->meetupEvents->filter(function ($event) {
            return !$event->isArchived();
        });

        $archivedEvents = $group->meetupEvents->filter(function ($event) {
            return $event->isArchived();
        });

        return view("meetup_group.show", [
            "group" => $group,
            "upcomingEvents" => $upcomingEvents,
            "archivedEvents" => $archivedEvents,
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

        $request->validate(
            [
                "name" => "required|not_regex:/http/i",
                "email" => "nullable|email|required_without:mobile_number",
                "mobile_number" => "nullable|required_without:email",
            ],
            [
                "name.not_regex" =>
                    "We don't allow any submissions if your name contains the substring `http`. Sorry if you validly have this as your name!",
            ],
        );

        if ($request->email) {
            $person = Person::findOrCreateByEmail($request->email);

            // Handle subscription checkbox
            if ($request->has("subscribe")) {
                $group
                    ->subscribers()
                    ->updateOrCreate(
                        ["email" => $request->email],
                        ["is_confirmed" => $person->isVerified()],
                    );
            }

            $rsvp = RSVP::updateOrCreate(
                [
                    "meetup_event_id" => $event->id,
                    "email" => $request->email,
                ],
                [
                    "name" => $request->name,
                    "is_confirmed" => $person->isVerified(),
                ],
            );

            if ($person->isVerified()) {
                // Send confirmation email
                Mail::to($request->email)->send(
                    new RsvpConfirmation($request->name, $event, $group),
                );

                return redirect()
                    ->route("showEvent", [
                        "groupSlug" => $group->slug,
                        "eventSlug" => $event->slug,
                    ])
                    ->with(
                        "message",
                        "Thank you for your RSVP! We're excited to see you there.",
                    )
                    ->with("rsvp_success", true);
            } else {
                // Send verification email
                $person->sendVerificationEmail("rsvp", $rsvp, $group, $event);

                return redirect()
                    ->route("showEvent", [
                        "groupSlug" => $group->slug,
                        "eventSlug" => $event->slug,
                    ])
                    ->with(
                        "message",
                        "Please check your email to verify your address and complete your RSVP. (Sorry we need to do this - it's because spammers keep filling out fake RSVPs!)",
                    )
                    ->with("rsvp_pending", true);
            }
        } else {
            // Mobile-only RSVP not supported yet
            abort(
                401,
                "Mobile-only RSVPs are not supported yet. Please provide an email address.",
            );
        }
    }

    public function subscribe(Request $request, $groupSlug)
    {
        $group = MeetupGroup::where("slug", $groupSlug)->firstOrFail();

        // Honeypot check - if the bot filled out the hidden field, silently redirect
        if ($request->filled("website")) {
            return redirect()->route("showGroup", ["groupSlug" => $groupSlug]);
        }

        // Time check - form submissions faster than 2 seconds are likely bots
        $formRenderedAt = $request->input("_rendered_at");
        if ($formRenderedAt && time() - intval($formRenderedAt) < 2) {
            return redirect()->route("showGroup", ["groupSlug" => $groupSlug]);
        }

        $request->validate([
            "email" => "required|email",
        ]);

        $person = Person::findOrCreateByEmail($request->email);
        $subscriber = $group
            ->subscribers()
            ->updateOrCreate(
                ["email" => $request->email],
                ["is_confirmed" => $person->isVerified()],
            );

        if ($person->isVerified()) {
            $message =
                "Thanks for subscribing! We'll send you an email when we announce our next event.";
            $subscribe_success = true;
            $subscribe_pending = false;
        } else {
            // Send an email verification message
            $person->sendVerificationEmail("subscription", $subscriber, $group);

            $message =
                "Please check your email to verify your address and complete your subscription.";
            $subscribe_success = false;
            $subscribe_pending = true;
        }

        return redirect()
            ->route("showGroup", ["groupSlug" => $groupSlug])
            ->with("message", $message)
            ->with("subscribe_success", $subscribe_success)
            ->with("subscribe_pending", $subscribe_pending);
    }

    public function verifyEmail(Request $request)
    {
        // Verify the signed URL
        if (!$request->hasValidSignature()) {
            abort(401, "This verification link has expired or is invalid.");
        }

        $email = $request->query("email");
        $type = $request->query("type");

        // Find and verify the person
        $person = Person::where("email", $email)->first();
        if (!$person) {
            abort(404, "Email not found.");
        }

        $person->markAsVerified();

        // Get the specific RSVP if this was for an RSVP
        if ($type === "rsvp" && $request->has("rsvp_id")) {
            $rsvp = RSVP::find($request->query("rsvp_id"));
            if ($rsvp) {
                $event = $rsvp->meetupEvent;
                $group = $event->meetupGroup;

                // Send RSVP confirmation email
                Mail::to($email)->send(
                    new RsvpConfirmation($rsvp->name, $event, $group),
                );

                return redirect()
                    ->route("showEvent", [
                        "groupSlug" => $group->slug,
                        "eventSlug" => $event->slug,
                    ])
                    ->with(
                        "message",
                        "Email verified! Your RSVP is now confirmed.",
                    );
            }
        }

        // For subscriptions or if RSVP not found
        // Try to find a group they subscribed to
        $subscription = Subscriber::where("email", $email)->first();
        if ($subscription) {
            $group = $subscription->meetupGroup;
            return redirect()
                ->route("showGroup", ["groupSlug" => $group->slug])
                ->with(
                    "message",
                    "Your email is verified - thanks for subscribing! We'll send you an email when we announce our next event.",
                );
        }

        // Fallback redirect
        return redirect("/")->with("message", "Email verified successfully!");
    }
}
