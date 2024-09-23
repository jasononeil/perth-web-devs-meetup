<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("rsvps", function (Blueprint $table) {
            $table->string("email")->nullable()->change();
            $table->string("mobile_number")->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table("rsvps", function (Blueprint $table) {
            $table->string("email")->change();
            $table->dropColumn("mobile_number");
        });
    }
};
