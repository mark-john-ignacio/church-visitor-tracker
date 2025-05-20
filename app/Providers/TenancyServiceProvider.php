<?php
namespace App\Providers;

use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Stancl\Tenancy\Events;
use Stancl\Tenancy\Jobs;
use Stancl\Tenancy\Listeners;
use Stancl\Tenancy\Middleware;
use App\Http\Middleware\InitializeTenancyBySession;

class TenancyServiceProvider extends ServiceProvider
{
    // Existing event listener code...
    
    public function boot()
    {
        $this->configureRoutes();
        
        // Register the session middleware globally so it's always active
        $this->app['router']->aliasMiddleware('tenant.session', InitializeTenancyBySession::class);
        
        // Add this to make sure it's registered properly
        $this->app->singleton(InitializeTenancyBySession::class);
    }

    protected function configureRoutes()
    {
        // Configure the routes directly without using Stancl's route helper
        // This ensures our custom middleware gets used instead
        if (file_exists(base_path('routes/tenant.php'))) {
            Route::middleware([
                'web',
                InitializeTenancyBySession::class,
            ])->group(base_path('routes/tenant.php'));
        }
    }
}