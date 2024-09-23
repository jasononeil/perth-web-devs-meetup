<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MeetupEventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Add a meetup on Sep 18 2024 for "perth-web-devs"
        $group = \App\Models\MeetupGroup::where(
            "slug",
            "perth-web-devs"
        )->first();

        if ($group) {
            \App\Models\MeetupEvent::create([
                "meetup_group_id" => $group->id,
                "name" => "First drinks!",
                "slug" => "first-drinks-oct-2024",
                "description" => "This is a meetup event.",
                "location" => "Market Grounds, Perth",
                "start_time" => "2024-09-18 17:30:00",
                "end_time" => "2024-09-18 19:00:00",
                "max_attendance" => 30,
            ]);
        }
    }
}
