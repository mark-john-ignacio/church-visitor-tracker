<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\NavigationController;

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

    Route::resource('roles', RoleController::class);
    Route::resource('permissions', PermissionController::class);
    Route::resource('navigation', NavigationController::class);
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';