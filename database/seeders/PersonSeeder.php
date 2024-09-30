<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Person;

class PersonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        Person::create([
            "name" => "Jason O'Neil",
            "email" => "jason@jasononeil.au",
            "profile_image_url" => "/img/jason.jpg",
        ]);
    }
}
