<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MeetupGroupController;

Route::get("/", function () {
    return redirect("/meetups/perth-web-devs/");
});

Route::get("/meetups/{groupSlug}", [
    MeetupGroupController::class,
    "show",
])->name("showGroup");
Route::get("/meetups/{groupSlug}/events/{eventSlug}", [
    MeetupGroupController::class,
    "showEvent",
])->name("showEvent");
Route::post("/meetups/{groupSlug}/events/{eventSlug}/rsvp", [
    MeetupGroupController::class,
    "rsvp",
])->name("rsvp");

Route::post("/meetups/{groupSlug}/subscribe", [
    MeetupGroupController::class,
    "subscribe",
])->name("subscribe");
