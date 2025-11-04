<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RSVP extends Model
{
    use HasFactory;

    protected $table = "rsvps";

    protected $fillable = [
        "meetup_event_id",
        "name",
        "email",
        "mobile",
        "is_confirmed",
    ];

    public function meetupEvent()
    {
        return $this->belongsTo("App\Models\MeetupEvent");
    }

    #[Scope]
    protected function confirmed(Builder $query): void
    {
        $query->where('is_confirmed', true);
    }

    public function isConfirmed(): bool
    {
        return $this->is_confirmed;
    }
}
