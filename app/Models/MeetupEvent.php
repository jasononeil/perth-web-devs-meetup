<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MeetupEvent extends Model
{
    use HasFactory;

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
}
