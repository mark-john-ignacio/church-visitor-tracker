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
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Display name (e.g., "Dashboard", "User Management")
            $table->string('route')->nullable(); // Route name or URL (e.g., "dashboard", "/admin/users")
            $table->string('icon')->nullable(); // Icon identifier (e.g., "LayoutGrid", "Users") - map this to Lucide icons later
            $table->string('permission_name')->nullable(); // Required permission name (from spatie/laravel-permission)
            $table->unsignedBigInteger('parent_id')->nullable(); // For submenus
            $table->integer('order')->default(0); // To control display order
            $table->enum('type', ['main', 'footer', 'user'])->default('main'); // To distinguish between nav sections
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};
