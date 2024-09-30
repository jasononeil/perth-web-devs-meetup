<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MeetupGroup extends Model
{
    use HasFactory;

    public function meetupEvents()
    {
        return $this->hasMany("App\Models\MeetupEvent");
    }

    public function subscribers()
    {
        return $this->hasMany(Subscriber::class);
    }

    public function organisers()
    {
        return $this->belongsToMany(
            "App\Models\Person",
            "meetup_group_organisers"
        );
    }
}
