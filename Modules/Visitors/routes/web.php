<?php

use Illuminate\Support\Facades\Route;
use Modules\Visitors\Http\Controllers\VisitorController;
use Modules\Visitors\Http\Controllers\FollowUpController;

Route::middleware(['auth', 'verified'])->group(function () {
    
    // Visitor routes
    Route::resource('visitors', VisitorController::class);
    Route::get('visitors/export', [VisitorController::class, 'export'])
        ->name('visitors.export');
    
    // Follow-up routes
    Route::resource('followups', FollowUpController::class);
    Route::post('followups/{followup}/complete', [FollowUpController::class, 'complete'])
        ->name('followups.complete');
    
});
