<?php

namespace Database\Seeders;

use App\Models\Person;
use Illuminate\Database\Seeder;

class PersonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        Person::create([
            'name' => "Jason O'Neil",
            'email' => 'jason@jasononeil.au',
            'profile_image_url' => '/img/jason.jpg',
        ]);
    }
}
