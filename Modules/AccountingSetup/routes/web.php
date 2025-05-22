<?php

use Illuminate\Support\Facades\Route;
use Modules\AccountingSetup\Http\Controllers\AccountingSetupController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('accountingsetups', AccountingSetupController::class)->names('accountingsetup');
});
