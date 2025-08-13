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
        Schema::create('meetup_event_mail_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meetup_event_message_id')->constrained()->onDelete('cascade');
            $table->string('recipient_email');
            $table->timestamp('sent_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meetup_event_mail_logs');
    }
};
