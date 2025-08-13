<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MeetupEventMailLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'meetup_event_message_id',
        'recipient_email',
        'sent_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    public function meetupEventMessage()
    {
        return $this->belongsTo(MeetupEventMessage::class);
    }
}
