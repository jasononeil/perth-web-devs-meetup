<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MeetupGroupController;

Route::get("/", function () {
    return redirect("/meetups/perth-web-devs/");
});

Route::get("/meetups/{groupSlug}", [MeetupGroupController::class, "show"]);
Route::get("/meetups/{groupSlug}/events/{eventSlug}", [
    MeetupGroupController::class,
    "showEvent",
]);
