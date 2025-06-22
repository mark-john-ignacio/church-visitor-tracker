<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Legacy field mapping from bank.sql:
     * compcode → company_id (foreign key)
     * ccode → bank_code
     * cname → bank_name
     * cacctno → chart_account_code
     * cacctnoex → chart_account_code_external
     * cbankacctno → bank_account_number
     * caccountname → account_name
     * ccontact → contact_person
     * cdesignation → designation
     * cemail → email
     * cphoneno → phone_number
     * cmobile → mobile_number
     * caddress → address
     * ccity → city
     * cstate → state_province
     * ccountry → country
     * czip → postal_code
     * cstatus → status
     * cdoctype → document_type
     */
    public function up(): void
    {
        Schema::create('banks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            
            // Bank identification (Required fields)
            $table->string('bank_code', 10)->comment('Unique bank code within company (Legacy: ccode)');
            $table->string('bank_name', 50)->nullable()->comment('Bank name/branch name (Legacy: cname)');
            
            // Chart of accounts integration
            $table->string('chart_account_code', 50)->nullable()->comment('Link to chart of accounts (Legacy: cacctno)');
            $table->string('chart_account_code_external', 50)->nullable()->comment('External chart account reference (Legacy: cacctnoex)');
            
            // Bank account details
            $table->string('bank_account_number', 50)->nullable()->comment('Bank account number (Legacy: cbankacctno)');
            $table->string('account_name', 100)->nullable()->comment('Account holder name (Legacy: caccountname)');
            
            // Contact information
            $table->string('contact_person', 50)->nullable()->comment('Primary contact person (Legacy: ccontact)');
            $table->string('designation', 50)->nullable()->comment('Contact person designation (Legacy: cdesignation)');
            $table->string('email', 50)->nullable()->comment('Bank contact email (Legacy: cemail)');
            $table->string('phone_number', 50)->nullable()->comment('Bank phone number (Legacy: cphoneno)');
            $table->string('mobile_number', 50)->nullable()->comment('Bank mobile number (Legacy: cmobile)');
            
            // Address information
            $table->string('address', 100)->nullable()->comment('Bank branch address (Legacy: caddress)');
            $table->string('city', 50)->nullable()->comment('City (Legacy: ccity)');
            $table->string('state_province', 50)->nullable()->comment('State or Province (Legacy: cstate)');
            $table->string('country', 50)->default('PHILIPPINES')->comment('Country (Legacy: ccountry)');
            $table->string('postal_code', 10)->nullable()->comment('ZIP/Postal code (Legacy: czip - changed from int to string)');
            
            // Status and type
            $table->string('status', 20)->default('ACTIVE')->comment('Bank account status (Legacy: cstatus)');
            $table->unsignedTinyInteger('document_type')->default(1)->comment('Document type classification (Legacy: cdoctype)');
            
            $table->timestamps();
            
            // Indexes for performance and constraints
            $table->unique(['company_id', 'bank_code'], 'banks_company_code_unique');
            $table->index(['company_id', 'status'], 'banks_company_status_index');
            $table->index(['company_id', 'bank_name'], 'banks_company_name_index');
            $table->index('chart_account_code', 'banks_chart_account_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banks');
    }
};
