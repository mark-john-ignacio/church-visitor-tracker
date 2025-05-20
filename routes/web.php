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
        // Diagnostic route - remove in production
        Route::get('/debug', function () {
            $data = [
                'users' => \App\Models\User::with('companies')->get(),
                'companies' => \App\Models\Company::all(),
                'user_companies' => \DB::table('user_companies')->get(),
                'chart_of_accounts' => \App\Models\ChartOfAccount::all(),
                'current_tenant' => tenant() ? [
                    'id' => tenant()->id,
                    'name' => tenant()->name,
                    'display_name' => tenant()->display_name,
                ] : null,
                'active_company_id' => session('active_company_id'),
            ];
            return response()->json($data);
        });

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

        // Chart of Accounts Route - Example for tenant-specific data
        Route::resource('chart-of-accounts', \App\Http\Controllers\ChartOfAccountController::class);
        
        // Include other auth-required routes
        require __DIR__.'/settings.php';
    });

// Auth routes (keep outside of tenant middleware)
require __DIR__.'/auth.php';