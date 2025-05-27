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
        Schema::create('chart_of_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->string('account_code');
            $table->string('account_name');
            $table->enum('account_category', ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'COST OF SALES', 'EXPENSES']);

            $table->enum('account_type', ['General', 'Detail'])->default('Detail'); 
            $table->boolean('is_contra_account')->default(false);
            $table->unsignedTinyInteger('level')->default(1);
            $table->foreignId('header_account_id')->nullable()->constrained('chart_of_accounts')->onDelete('set null');

            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->unique(['company_id', 'account_code']);
            $table->index(['company_id', 'level']);
            $table->index(['company_id', 'header_account_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chart_of_accounts');
    }
};