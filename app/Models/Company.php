<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;

class Company extends BaseTenant implements TenantWithDatabase
{
    use HasFactory, HasDatabase, HasDomains;
    
    // No longer using Stancl\Tenancy\Database\Concerns\GeneratesIds trait
    
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'companies';
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [

    ];
    
    /**
     * Get the users that belong to this company.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_companies');
    }
}
