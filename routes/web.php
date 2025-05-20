<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\NavigationController;
use App\Http\Controllers\CompanySwitcherController;
use App\Http\Middleware\InitializeTenancyBySession;

// Routes that don't need tenant context
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Apply custom tenant middleware to all authenticated routes
Route::middleware(['web', 'auth', InitializeTenancyBySession::class])
    ->group(function () {

        // Dashboard
        Route::get('dashboard', fn () => Inertia::render('dashboard'))
            ->middleware('can:view_admin')
            ->name('dashboard');
            
        // Admin routes
        Route::middleware(['verified', 'can:manage_users,' . App\Models\User::class])
            ->prefix('admin')
            ->name('admin.')
            ->group(function () {
                Route::resource('users', UserManagementController::class)
                        ->except(['show']);

                Route::resource('roles', RoleController::class);
                Route::resource('permissions', PermissionController::class);
                Route::resource('navigation', NavigationController::class);
            });

        // Company Switching Routes
        Route::prefix('companies')
            ->name('companies.')
            ->group(function () {
                Route::post('switch', [CompanySwitcherController::class, 'switch'])->name('switch');
                Route::get('list', [CompanySwitcherController::class, 'getCompanies'])->name('list');
            });

        Route::middleware(['can:manage_chart_of_accounts'])
            ->prefix('masterfiles')
            ->name('masterfiles.')
            ->group(function () {
                Route::resource('chart-of-accounts', \App\Http\Controllers\Masterfiles\ChartOfAccountController::class);
            });

        // Settings routes
        require __DIR__.'/settings.php';
    });

// Auth routes (keep outside of tenant middleware)
require __DIR__.'/auth.php';