<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('follow_ups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->foreignId('visitor_id')->constrained()->onDelete('cascade');
            $table->foreignId('followed_up_by')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pending', 'contacted', 'scheduled', 'completed', 'no_response', 'not_interested']);
            $table->enum('method', ['phone', 'email', 'text', 'in_person', 'mail']);
            $table->text('notes')->nullable();
            $table->datetime('scheduled_at')->nullable();
            $table->datetime('completed_at')->nullable();
            $table->json('metadata')->nullable(); // Additional data like call duration, email opened, etc.
            $table->timestamps();

            $table->index(['company_id', 'status']);
            $table->index(['company_id', 'visitor_id']);
            $table->index(['company_id', 'followed_up_by']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('follow_ups');
    }
};
