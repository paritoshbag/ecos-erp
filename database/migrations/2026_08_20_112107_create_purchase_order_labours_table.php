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
        Schema::create('purchase_order_labours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('master_labour_id')->constrained()->restrictOnDelete();
            $table->unsignedSmallInteger('line_no');
            $table->text('description');
            $table->string('hsn_sac', 16)->nullable();
            $table->decimal('quantity', 14, 3);
            $table->string('unit', 10);
            $table->decimal('rate', 15, 2);
            $table->decimal('freight_and_insurance', 15, 2)->default(0);
            $table->decimal('amount', 15, 2);
            $table->timestamps();

            $table->unique(['purchase_order_id', 'line_no']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_order_labours');
    }
};
