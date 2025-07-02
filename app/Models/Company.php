<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class Company extends Model implements Auditable
{
    use HasFactory, AuditableTrait;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'email',
        'phone',
        'address',
        'logo_url',
        'settings',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
    ];
    
    /**
     * Get the users that belong to this company.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_companies')
            ->withPivot('is_default')
            ->withTimestamps();
    }

    /**
     * Get the visitors for this company.
     */
    public function visitors(): HasMany
    {
        return $this->hasMany(\Modules\Visitors\app\Models\Visitor::class);
    }

    /**
     * Get the follow-ups for this company.
     */
    public function followUps(): HasMany
    {
        return $this->hasMany(\Modules\Visitors\app\Models\FollowUp::class);
    }

    /**
     * Scope a query to only include active companies.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
