<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RSVP extends Model
{
    use HasFactory;

    protected $table = "rsvps";

    public function meetupEvent()
    {
        return $this->belongsTo("App\Models\MeetupEvent");
    }
}
