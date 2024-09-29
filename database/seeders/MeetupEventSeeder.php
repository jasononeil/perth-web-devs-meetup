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
                "description" =>
                    "Casual drinks after work with others in the Perth Web Dev community.",
                "location" => "Market Grounds, Perth",
                "start_time" => "2024-10-16 17:30:00",
                "end_time" => "2024-10-16 19:00:00",
                "max_attendance" => 30,
            ]);
            \App\Models\MeetupEvent::create([
                "meetup_group_id" => $group->id,
                "name" => "Show and tell",
                "slug" => "show-and-tell-nov-2024",
                "description" =>
                    "Here from a few people about what they do at work and get a look at their current projects.",
                "location" => "To be confirmed",
                "start_time" => "2024-11-13 17:30:00",
                "end_time" => "2024-11-13 19:30:00",
                "max_attendance" => 30,
            ]);
        }
    }
}
