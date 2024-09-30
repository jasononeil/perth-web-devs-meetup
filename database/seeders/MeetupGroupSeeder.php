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
        $description = <<<EOD
A Perth meetup group for web developers, software engineers, designers, PMs and whoever else is building things for the web.

We'll have a mix of social catch-ups and meetups with technical talks or discussions about our industry.
EOD;

        MeetupGroup::create([
            "slug" => "perth-web-devs",
            "name" => "Perth Web Devs",
            "description" => $description,
            // Add any other fields you need here.
        ]);
    }
}
