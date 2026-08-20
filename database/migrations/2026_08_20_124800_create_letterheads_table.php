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
        Schema::create('letterheads', function (Blueprint $table) {
            $table->id();
            $table->string('type', 20)->index();
            $table->string('name');
            $table->string('source_preset', 50)->nullable()->index();
            $table->string('paper_size', 20)->default('a4');
            $table->boolean('is_active')->default(false)->index();
            $table->boolean('is_custom')->default(false);
            $table->string('logo_disk')->nullable();
            $table->string('logo_key')->nullable();
            $table->string('logo_mime')->nullable();
            $table->json('header')->nullable();
            $table->json('footer')->nullable();
            $table->string('background_disk')->nullable();
            $table->string('background_key')->nullable();
            $table->string('background_mime')->nullable();
            $table->decimal('writable_top', 5, 2)->default(18);
            $table->decimal('writable_left', 5, 2)->default(8);
            $table->decimal('writable_width', 5, 2)->default(84);
            $table->decimal('writable_height', 5, 2)->default(65);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('letterheads');
    }
};
