<?php

use Illuminate\Support\Facades\Route;
use Modules\Visitors\Http\Controllers\VisitorsController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('visitors', VisitorsController::class)->names('visitors');
});
