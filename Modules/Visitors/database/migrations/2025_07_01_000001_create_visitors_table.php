<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visitors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->date('visit_date');
            $table->string('invited_by')->nullable();
            $table->json('tags')->nullable();
            $table->text('notes')->nullable();
            $table->string('service_type')->nullable(); // Sunday Service, Bible Study, etc.
            $table->boolean('is_first_time')->default(true);
            $table->string('age_group')->nullable(); // Child, Teen, Adult, Senior
            $table->string('how_did_you_hear')->nullable(); // Friend, Website, Social Media, etc.
            $table->boolean('wants_followup')->default(true);
            $table->boolean('wants_newsletter')->default(false);
            $table->timestamps();

            $table->index(['company_id', 'visit_date']);
            $table->index(['company_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visitors');
    }
};
