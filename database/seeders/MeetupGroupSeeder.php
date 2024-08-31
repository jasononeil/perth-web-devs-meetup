<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\MeetupGroup;

class MeetupGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        MeetupGroup::create([
            "slug" => "perth-web-devs",
            "name" => "Perth Web Devs",
            "description" =>
                "A meetup group for web developers in Perth, Western Australia. A mix of social catch-ups and meetups with technical talks.",
            // Add any other fields you need here.
        ]);
    }
}
