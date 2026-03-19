<?php

namespace App\Console\Commands;

use App\Models\Person;
use Illuminate\Console\Command;

class VerifyPersonEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'meetup:verify-email {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manually verify an email address';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $person = Person::where('email', $email)->first();

        if (! $person) {
            $this->error("No person found with email: {$email}");

            return 1;
        }

        if ($person->isVerified()) {
            $this->info("Email already verified: {$email}");

            return 0;
        }

        $person->markAsVerified();

        $this->info("Email verified: {$email}");

        return 0;
    }
}
