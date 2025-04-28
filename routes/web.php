<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\UserManagementController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', function () {
        return inertia('admin/index');
    })->middleware('can:view_admin')->name('index');

    Route::get('/users', function () {
        return inertia('admin/users/index');
    })->middleware('can:manage_users')->name('users.index');

    Route::get('/roles', function () {
        return inertia('admin/roles/index');
    })->middleware('can:manage_roles')->name('roles.index');

    Route::get('/navigation', function () {
        return inertia('admin/navigation/index');
    })->middleware('can:manage_navigation')->name('navigation.index');

    Route::get('/users', [UserManagementController::class, 'index'])
    // ->middleware('can:manage_users') // Middleware check is now handled by authorize() in controller
    ->name('users.index');
    Route::get('/users/create', [UserManagementController::class, 'create'])->name('users.create');
    Route::post('/users', [UserManagementController::class, 'store'])->name('users.store');


});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
