<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MeetupEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        "meetup_group_id",
        "name",
        "slug",
        "description",
        "location",
        "start_time",
        "end_time",
        "max_attendance",
        "accepting_rsvps",
    ];

    public function meetupGroup()
    {
        return $this->belongsTo("App\Models\MeetupGroup");
    }

    public function rsvps()
    {
        return $this->hasMany("App\Models\RSVP");
    }

    public function remainingPlaces()
    {
        return $this->max_attendance - $this->rsvps()->count();
    }

    public function formattedDate()
    {
        return date("l, jS F Y", strtotime($this->start_time));
    }

    public function formattedTime()
    {
        return date("g:ia", strtotime($this->start_time)) .
            " - " .
            date("g:ia", strtotime($this->end_time));
    }

    public function hosts()
    {
        return $this->belongsToMany("App\Models\Person", "meetup_event_host");
    }
}
