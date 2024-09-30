<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table("meetup_events", function (Blueprint $table) {
            $table
                ->boolean("accepting_rsvps")
                ->default(false)
                ->after("max_attendance");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table("meetup_events", function (Blueprint $table) {
            $table->dropColumn("accepting_rsvps");
        });
    }
};
