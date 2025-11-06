<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use App\Mail\VerifyEmail;

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

    public function sendVerificationEmail(
        string $type,
        $relatedModel,
        MeetupGroup $group,
        ?MeetupEvent $event = null,
    ): string {
        $parameters = [
            "email" => $this->email,
            "type" => $type,
        ];

        // Add type-specific parameter
        if ($type === "rsvp" && $relatedModel instanceof RSVP) {
            $parameters["rsvp_id"] = $relatedModel->id;
        } elseif (
            $type === "subscription" &&
            $relatedModel instanceof Subscriber
        ) {
            $parameters["subscriber_id"] = $relatedModel->id;
        }

        // Generate signed URL
        $verificationUrl = URL::temporarySignedRoute(
            "verify.email",
            now()->addHours(48),
            $parameters,
        );

        // Send verification email
        Mail::to($this->email)->send(
            new VerifyEmail($verificationUrl, $type, $event, $group),
        );

        return $verificationUrl;
    }
}
