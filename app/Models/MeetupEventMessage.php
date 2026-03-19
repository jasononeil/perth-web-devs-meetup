<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MeetupEventMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'meetup_event_id',
        'message_type', // enum: 'announcement', 'bump', 'reminder'
        'custom_message',
    ];

    protected $casts = [
        'message_type' => 'string',
    ];

    public function meetupEvent()
    {
        return $this->belongsTo(MeetupEvent::class);
    }

    public function mailLogs()
    {
        return $this->hasMany(MeetupEventMailLog::class);
    }
}
