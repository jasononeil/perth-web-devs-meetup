<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('meetup_event_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meetup_event_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('message_type', ['announcement', 'bump', 'reminder']);
            $table->text('custom_message')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meetup_event_messages');
    }
};
