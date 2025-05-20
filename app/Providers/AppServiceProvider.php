<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;
use Stancl\Tenancy\Tenancy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Add a macro to the Builder class to make it easy to scope models to the current tenant
        Builder::macro('tenantAware', function () {
            /** @var \Illuminate\Database\Eloquent\Builder $this */
            if (app(Tenancy::class)->initialized && app(Tenancy::class)->tenant) {
                $model = $this->getModel();
                $tenantIdColumn = $model::$tenantIdColumn ?? 'company_id';
                
                return $this->where($tenantIdColumn, app(Tenancy::class)->tenant->id);
            }
            
            return $this;
        });

        // No need to manually call global scopes - the BelongsToTenant trait already handles this
    }
}
