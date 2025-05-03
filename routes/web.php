<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\UserManagementController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Dashboard
Route::get('dashboard', fn () => Inertia::render('dashboard'))
    ->middleware('can:view_admin')
    ->name('dashboard');

Route::middleware(['auth','verified','can:manage_users,' . App\Models\User::class])
->prefix('admin')
->name('admin.')
->group(function(){
    Route::resource('users', UserManagementController::class)
            ->except(['show']);
    // …other admin resources
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';