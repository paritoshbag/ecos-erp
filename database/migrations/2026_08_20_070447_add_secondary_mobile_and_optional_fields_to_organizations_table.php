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
        Schema::table('organizations', function (Blueprint $table) {
            $table->string('secondary_mobile', 10)->nullable()->after('mobile');
            $table->string('field4')->nullable()->after('field3');
            $table->string('field5')->nullable()->after('field4');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn(['secondary_mobile', 'field4', 'field5']);
        });
    }
};
