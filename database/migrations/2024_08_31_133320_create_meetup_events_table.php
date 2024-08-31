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
        Schema::create("meetup_events", function (Blueprint $table) {
            $table->id();
            $table
                ->foreignId("meetup_group_id")
                ->constrained()
                ->onDelete("cascade");
            $table->string("name");
            $table->string("location");
            $table->timestamp("start_time");
            $table->timestamp("end_time");
            $table->string("description");
            $table->integer("max_attendance");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("meetup_events");
    }
};
