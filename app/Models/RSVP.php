<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RSVP extends Model
{
    use HasFactory;

    protected $table = "rsvps";

    protected $fillable = ["meetup_event_id", "name", "email", "mobile"];

    public function meetupEvent()
    {
        return $this->belongsTo("App\Models\MeetupEvent");
    }
}
