<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscriber extends Model
{
    use HasFactory;

    protected $fillable = ["email", "is_confirmed"];

    public function meetupGroup()
    {
        return $this->belongsTo(MeetupGroup::class);
    }

    public function scopeConfirmed(Builder $query): void
    {
        $query->where("is_confirmed", true);
    }

    public function isConfirmed(): bool
    {
        return $this->is_confirmed;
    }
}
