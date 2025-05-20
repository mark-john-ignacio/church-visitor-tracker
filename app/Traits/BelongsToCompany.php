<?php

namespace App\Traits;

use App\Models\Company;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Contracts\Tenant;
use Stancl\Tenancy\Database\TenantScope;

/**
 * @property-read Company $tenant
 */
trait BelongsToCompany
{
    public static function bootBelongsToCompany()
    {
        // When model is created, fill the company_id column
        static::creating(function (Model $model) {
            if (! $model->getAttribute('company_id') && tenant()) {
                $model->setAttribute('company_id', tenant()->getTenantKey());
            }
        });

        // Global scope to only show models for current tenant
        static::addGlobalScope('company', function (Builder $builder) {
            if (tenant()) {
                $builder->where('company_id', tenant()->getTenantKey());
            }
        });
    }

    public function tenant()
    {
        return $this->company();
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
