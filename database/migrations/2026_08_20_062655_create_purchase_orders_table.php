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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();

            $table->string('po_number', 40)->unique();
            $table->date('po_date');
            $table->unsignedTinyInteger('order_type');
            $table->string('ccc', 10);
            $table->text('description');
            $table->decimal('po_amount', 15, 2)->default(0);
            $table->string('source', 16)->default('manual');

            $table->string('memo_number', 40)->nullable()->index();
            $table->date('memo_date')->nullable();
            $table->string('reference_no', 40)->nullable();
            $table->string('subject', 40)->nullable();

            $table->string('service_acceptance_no', 20)->nullable()->index();
            $table->date('service_acceptance_date')->nullable();
            $table->decimal('service_acceptance_amount', 15, 2)->nullable();
            $table->string('service_account_no', 80)->nullable();
            $table->decimal('accepted_amount', 15, 2)->nullable();

            $table->string('requisition_copy_no', 80)->nullable();
            $table->string('sirn_number', 80)->nullable();
            $table->string('completion_letter', 40)->nullable();
            $table->string('measurement_done', 40)->nullable();
            $table->string('mb_no', 40)->nullable();
            $table->boolean('mb_written')->default(false);
            $table->date('commenced_on')->nullable();
            $table->date('completed_on')->nullable();
            $table->date('measured_on')->nullable();
            $table->string('zmm_confirmation_no', 80)->nullable();

            $table->string('ccc_issue_no', 40)->nullable();
            $table->date('ccc_issue_date')->nullable();
            $table->date('ccc_receive_date')->nullable();

            $table->string('bill_issue_no', 10)->nullable();
            $table->date('bill_issue_date')->nullable();
            $table->string('bill_receive_no', 10)->nullable();
            $table->date('bill_receive_date')->nullable();
            $table->boolean('bill_signed')->default(false);
            $table->string('invoice_no', 40)->nullable()->index();
            $table->date('invoice_date')->nullable();
            $table->decimal('gross_bill_amount', 15, 2)->nullable();
            $table->decimal('cgst', 15, 2)->nullable();
            $table->decimal('sgst', 15, 2)->nullable();
            $table->decimal('total_gross_amount', 15, 2)->nullable();
            $table->decimal('security_deposit', 15, 2)->nullable();
            $table->decimal('income_tax', 15, 2)->nullable();
            $table->decimal('cess', 15, 2)->nullable();
            $table->decimal('wct', 15, 2)->nullable();
            $table->decimal('material_deduction', 15, 2)->nullable();
            $table->decimal('penalty', 15, 2)->nullable();
            $table->decimal('tax_deduction', 15, 2)->nullable();
            $table->decimal('net_amount_gst', 15, 2)->nullable();
            $table->decimal('net_amount', 15, 2)->nullable();
            $table->string('final_receipt_issue_no', 40)->nullable();
            $table->date('final_receipt_issue_date')->nullable();
            $table->date('deposit_date')->nullable();
            $table->date('payment_date')->nullable()->index();
            $table->string('payment_year', 40)->nullable()->index();
            $table->date('security_claimed_on')->nullable();
            $table->date('security_paid_on')->nullable();
            $table->string('srn_number', 40)->nullable();

            $table->timestamps();

            $table->index(['ccc', 'order_type', 'po_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
