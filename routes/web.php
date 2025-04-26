<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    Route::get('/', function () {
        return inertia('admin/index');
    })->middleware('can:view_admin')->name('admin.index');

    Route::get('/users', function () {
        return inertia('admin/users/index');
    })->middleware('can:manage_users')->name('admin.users.index');

    Route::get('/roles', function () {
        return inertia('admin/roles/index');
    })->middleware('can:manage_roles')->name('admin.roles.index');

    Route::get('/navigation', function () {
        return inertia('admin/navigation/index');
    })->middleware('can:manage_navigation')->name('admin.navigation.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
