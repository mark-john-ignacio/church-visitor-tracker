<?php

namespace App\Traits;

use App\Models\Company;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * @property-read Company $company
 */
trait BelongsToCompany
{
    public static function bootBelongsToCompany()
    {
        // When model is created, fill the company_id column
        static::creating(function (Model $model) {
            if (!$model->getAttribute('company_id')) {
                $companyId = session('company_id');
                if ($companyId) {
                    $model->setAttribute('company_id', $companyId);
                }
            }
        });

        // Global scope to only show models for current company
        static::addGlobalScope('company', function (Builder $builder) {
            $companyId = session('company_id');
            if ($companyId) {
                $builder->where('company_id', $companyId);
            }
        });
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Scope a query to only include models for a specific company.
     */
    public function scopeCompanyScope(Builder $query, int $companyId = null): Builder
    {
        $companyId = $companyId ?? session('company_id');
        
        if ($companyId) {
            return $query->where('company_id', $companyId);
        }
        
        return $query;
    }

    /**
     * Override the find method to enforce tenant isolation
     */
    public static function find($id, $columns = ['*'])
    {
        $instance = new static;
        $query = $instance->newQuery();
        
        $companyId = session('company_id');
        if ($companyId) {
            $query->where('company_id', $companyId);
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
        
        $companyId = session('company_id');
        if ($companyId) {
            $query->where('company_id', $companyId);
        }
        
        return $query->findOrFail($id, $columns);
    }
}