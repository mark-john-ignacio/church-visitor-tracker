<?php

use Illuminate\Support\Facades\Route;
use Modules\AccountingSetup\Http\Controllers\AccountingSetupController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('accountingsetups', AccountingSetupController::class)->names('accountingsetup');
});
