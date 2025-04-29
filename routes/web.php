<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\UserManagementController;

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('dashboard', fn () => Inertia::render('dashboard'))
        ->middleware('can:view_admin')
        ->name('index');

    // Users
    Route::get('/users', [UserManagementController::class, 'index'])
        ->middleware('can:manage_users')     
        ->name('users.index');

    Route::get('/users/create', [UserManagementController::class, 'create'])
        ->middleware('can:manage_users')   
        ->name('users.create');

    Route::post('/users', [UserManagementController::class, 'store'])
        ->middleware('can:manage_users')  
        ->name('users.store');

    Route::get('/users/{user}/edit', [UserManagementController::class, 'edit'])
        ->middleware('can:manage_users')  
        ->name('users.edit');

    Route::put('/users/{user}', [UserManagementController::class, 'update'])
    ->middleware('can:manage_users')
    ->name('users.update');

    // Roles
    Route::get('/roles', fn () => Inertia::render('admin/roles/index'))
        ->middleware('can:manage_roles')
        ->name('roles.index');

    // Navigation
    Route::get('/navigation', fn () => Inertia::render('admin/navigation/index'))
        ->middleware('can:manage_navigation')
        ->name('navigation.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';