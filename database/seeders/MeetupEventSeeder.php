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
        $description_first_drinks = <<<EOD
Casual drinks after work with others in the Perth Web Dev community.

We're meeting at Market Grounds in the city (right outside the Perth busport, a short walk from the train station).

With this meetup group, I'm hoping to alternate between events with structured talks / discussions, and casual drinks like this one.

This is the first of it's type! Come along.
EOD;

        $description_show_and_tell = <<<EOD
Get a peak into what different people are working on.

We'll have 3 or 4 people tell us about their role and their current project, give us a short demo or show us some code. And some time for questions.

Hopefully it'll be interesting, fun, and give you a bigger picture of the different kinds of roles and projects happening in our industry.

If you're interested in sharing, let me know.
EOD;

        // Add a meetup on Sep 18 2024 for "perth-web-devs"
        $group = \App\Models\MeetupGroup::where(
            "slug",
            "perth-web-devs"
        )->firstOrFail();

        $host = \App\Models\Person::where(
            "email",
            "jason@jasononeil.au"
        )->firstOrFail();

        $event1 = \App\Models\MeetupEvent::create([
            "meetup_group_id" => $group->id,
            "name" => ":first-of-type(drinks)",
            "slug" => "first-drinks-oct-2024",
            "description" => $description_first_drinks,
            "location" => "Market Grounds, Perth",
            "start_time" => "2024-10-16 17:30:00",
            "end_time" => "2024-10-16 19:00:00",
            "max_attendance" => 20,
        ]);
        $event1->hosts()->attach($host->id);

        $event2 = \App\Models\MeetupEvent::create([
            "meetup_group_id" => $group->id,
            "name" => "Show and tell",
            "slug" => "show-and-tell-nov-2024",
            "description" => $description_show_and_tell,
            "location" => "To be confirmed",
            "start_time" => "2024-11-13 17:30:00",
            "end_time" => "2024-11-13 19:30:00",
            "max_attendance" => 30,
        ]);
        $event2->hosts()->attach($host->id);
    }
}
