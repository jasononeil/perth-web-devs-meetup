<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Collect all unique email addresses from RSVPs and Subscribers
        $emails = collect();

        // Get unique emails from RSVPs with name data
        $rsvpEmails = DB::table('rsvps')
            ->select('email', 'name')
            ->whereNotNull('email')
            ->where('email', '!=', '')
            ->get()
            ->groupBy('email')
            ->map(function ($group) {
                // For each email, get the first non-empty name if available
                $name = $group->firstWhere('name', '!=', '')?->name ?? '';

                return [
                    'email' => $group[0]->email,
                    'name' => $name,
                ];
            });

        // Get unique emails from Subscribers (no name field)
        $subscriberEmails = DB::table('subscribers')
            ->select('email')
            ->whereNotNull('email')
            ->where('email', '!=', '')
            ->distinct()
            ->get()
            ->map(function ($row) {
                return [
                    'email' => $row->email,
                    'name' => '',
                ];
            });

        // Merge both collections, preferring RSVP names over empty names
        $allEmails = $rsvpEmails->merge($subscriberEmails)
            ->groupBy('email')
            ->map(function ($group) {
                // Prefer entries with non-empty names
                $withName = $group->firstWhere('name', '!=', '');

                return $withName ?? $group->first();
            });

        // Get existing people emails to avoid duplicates
        $existingEmails = DB::table('people')
            ->pluck('email')
            ->flip();

        // Prepare data for insertion
        $now = now();
        $peopleToInsert = $allEmails
            ->reject(function ($data) use ($existingEmails) {
                return isset($existingEmails[$data['email']]);
            })
            ->map(function ($data) use ($now) {
                return [
                    'email' => $data['email'],
                    'name' => $data['name'],
                    'profile_image_url' => '',
                    // Mark as verified since these are existing RSVPs/subscriptions
                    // (per the plan: "Existing data: Mark as verified")
                    'email_verified_at' => $now,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            })
            ->values()
            ->all();

        // Insert in batches to avoid memory issues
        if (! empty($peopleToInsert)) {
            $chunks = array_chunk($peopleToInsert, 100);
            foreach ($chunks as $chunk) {
                DB::table('people')->insert($chunk);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // We cannot safely reverse this migration as we don't know
        // which people records were created by this migration vs.
        // created through the application. Leave people table as-is.
    }
};
