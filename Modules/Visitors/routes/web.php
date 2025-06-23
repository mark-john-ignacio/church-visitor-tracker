<?php

use Illuminate\Support\Facades\Route;
use Modules\Visitors\Http\Controllers\VisitorsController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('visitors', VisitorsController::class)->names('visitors');
});
