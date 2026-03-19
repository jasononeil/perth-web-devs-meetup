<?php

namespace Database\Seeders;

use App\Models\MeetupGroup;
use Illuminate\Database\Seeder;

class MeetupGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $description = <<<'EOD'
A Perth meetup group for web developers, software engineers, designers, PMs and whoever else is building things for the web.

We'll have a mix of social catch-ups and meetups with technical talks or discussions about our industry.
EOD;

        $organiser = \App\Models\Person::where(
            'email',
            'jason@jasononeil.au'
        )->firstOrFail();

        $group1 = MeetupGroup::create([
            'slug' => 'perth-web-devs',
            'name' => 'Perth Web Devs',
            'description' => $description,
        ]);
        $group1->organisers()->attach($organiser->id);
    }
}
