<?php

namespace App\Traits;

use App\Models\Company;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Stancl\Tenancy\Contracts\Tenant;

/**
 * @property-read Company $tenant
 */
trait BelongsToCompany
{
    public static function bootBelongsToCompany()
    {
        // When model is created, fill the company_id column
        static::creating(function (Model $model) {
            if (!$model->getAttribute('company_id') && tenant()) {
                $model->setAttribute('company_id', tenant()->getTenantKey());
            }
        });

        // Global scope to only show models for current tenant
        static::addGlobalScope('company', function (Builder $builder) {
            if (tenant()) {
                $builder->where('company_id', tenant()->getTenantKey());
            }
        });

        // Enhance the findOrFail method to properly check tenant
        static::registerModelEvent('retrieved', function (Model $model) {
            if (tenant() && $model->getAttribute('company_id') != tenant()->getTenantKey()) {
                throw new ModelNotFoundException("No query results for model [" . get_class($model) . "] " . $model->getKey());
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

    /**
     * Override the find method to enforce tenant isolation
     */
    public static function find($id, $columns = ['*'])
    {
        $instance = new static;
        $query = $instance->newQuery();
        
        if (tenant()) {
            $query->where('company_id', tenant()->getTenantKey());
        }
        
        return $query->find($id, $columns);
    }

    /**
     * Override the findOrFail method to enforce tenant isolation
     */
    public static function findOrFail($id, $columns = ['*'])
    {
        $instance = new static;
        $query = $instance->newQuery();
        
        if (tenant()) {
            $query->where('company_id', tenant()->getTenantKey());
        }
        
        return $query->findOrFail($id, $columns);
    }
}