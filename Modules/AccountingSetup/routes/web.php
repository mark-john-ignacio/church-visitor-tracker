<?php

use Illuminate\Support\Facades\Route;
use Modules\AccountingSetup\Http\Controllers\ChartOfAccountController;
use App\Http\Middleware\InitializeTenancyBySession;

Route::middleware(['web', 'auth', InitializeTenancyBySession::class])
    ->group(function () {
        Route::middleware(['can:manage_chart_of_accounts'])
            ->prefix('masterfiles')
            ->name('masterfiles.')
            ->group(function () {
                Route::resource('chart-of-accounts', ChartOfAccountController::class);
            });
        });