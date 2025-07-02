<?php

use App\Http\Controllers\CompanyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NavigationController;
use App\Http\Controllers\RoleController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Welcome page (no auth required)
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'laravelVersion' => app()->version(),
        'phpVersion' => phpversion(),
    ]);
})->name('home');

// Authentication routes
require __DIR__.'/auth.php';

// Authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');
    
    // Company switching
    Route::get('/companies/{company}/switch', [CompanyController::class, 'switch'])
        ->name('companies.switch');
    Route::get('/api/user-companies', [CompanyController::class, 'getUserCompanies'])
        ->name('api.user-companies');
    
    // Admin routes
    Route::prefix('admin')->name('admin.')->group(function () {
        // Navigation management
        Route::resource('navigation', NavigationController::class)->except(['show', 'create', 'edit']);
        Route::patch('navigation/{menuItem}/reorder', [NavigationController::class, 'reorder'])
            ->name('navigation.reorder');
        Route::patch('navigation/{menuItem}/toggle', [NavigationController::class, 'toggle'])
            ->name('navigation.toggle');
            
        // Role management
        Route::resource('roles', RoleController::class)->except(['show', 'create', 'edit']);
    });

});