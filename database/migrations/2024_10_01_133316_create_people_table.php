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
        Schema::create("people", function (Blueprint $table) {
            $table->id();
            $table->string("name");
            $table->string("email")->unique();
            $table->string("profile_image_url");
            $table->timestamps();
        });
        Schema::create("meetup_event_hosts", function (Blueprint $table) {
            $table->id();
            $table->foreignId("meetup_event_id")->constrained();
            $table->foreignId("person_id")->constrained();
            $table->timestamps();
        });
        Schema::create("meetup_group_organisers", function (Blueprint $table) {
            $table->id();
            $table->foreignId("meetup_group_id")->constrained();
            $table->foreignId("person_id")->constrained();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("people");
        Schema::dropIfExists("meetup_event_hosts");
        Schema::dropIfExists("meetup_group_organisers");
    }
};
