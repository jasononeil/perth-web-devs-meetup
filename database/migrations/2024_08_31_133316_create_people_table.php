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
        Schema::create("meetup_event_host", function (Blueprint $table) {
            $table->id();
            $table->foreignId("meetup_event_id")->constrained();
            $table->foreignId("person_id")->constrained();
            $table->timestamps();
        });
        Schema::table("meetup_groups", function (Blueprint $table) {
            $table
                ->foreignId("organiser_id")
                ->after("description")
                ->constrained("people");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("people");
        Schema::dropIfExists("meetup_event_host");
        Schema::table("meetup_groups", function (Blueprint $table) {
            $table->dropForeign(["organiser_id"]);
            $table->dropColumn("organiser_id");
        });
    }
};
