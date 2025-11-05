<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class Person extends Model
{
    use HasFactory;

    protected $table = "people";

    protected $fillable = [
        "name",
        "email",
        "profile_image_url",
        "email_verified_at",
    ];

    protected $casts = [
        "email_verified_at" => "datetime",
    ];

    public function isVerified(): bool
    {
        return !is_null($this->email_verified_at);
    }

    public function markAsVerified(): void
    {
        $this->email_verified_at = now();
        $this->save();

        // Confirm all RSVPs and subscriptions for this email
        RSVP::where("email", $this->email)->update(["is_confirmed" => true]);
        Subscriber::where("email", $this->email)->update([
            "is_confirmed" => true,
        ]);
    }

    public static function findOrCreateByEmail(string $email): Person
    {
        return self::firstOrCreate(
            ["email" => $email],
            ["name" => "", "profile_image_url" => ""],
        );
    }
}
