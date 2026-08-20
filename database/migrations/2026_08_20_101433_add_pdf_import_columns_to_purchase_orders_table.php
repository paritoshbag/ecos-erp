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
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->string('project_id', 80)->nullable()->after('memo_date')->index();
            $table->string('order_no', 40)->nullable()->after('project_id');
            $table->string('pdf_disk', 32)->nullable()->after('srn_number');
            $table->string('pdf_key')->nullable()->after('pdf_disk');
            $table->string('pdf_original_name')->nullable()->after('pdf_key');
            $table->char('pdf_hash', 64)->nullable()->after('pdf_original_name')->unique();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropColumn([
                'project_id',
                'order_no',
                'pdf_disk',
                'pdf_key',
                'pdf_original_name',
                'pdf_hash',
            ]);
        });
    }
};
