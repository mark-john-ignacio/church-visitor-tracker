<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class User extends Authenticatable implements Auditable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles, AuditableTrait;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'avatar_url',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the companies that the user belongs to.
     */
    public function companies()
    {
        return $this->belongsToMany(Company::class, 'user_companies')
            ->withPivot('is_primary')
            ->withTimestamps();
    }

    /**
     * Get the user's default company.
     */
    public function defaultCompany()
    {
        return $this->companies()->wherePivot('is_primary', true)->first();
    }

    /**
     * Get the current company from session or default.
     */
    public function currentCompany()
    {
        $companyId = session('company_id');
        
        if ($companyId) {
            return $this->companies()->find($companyId);
        }
        
        return $this->defaultCompany();
    }

    /**
     * Check if user has access to a specific company.
     */
    public function hasAccessToCompany(int $companyId): bool
    {
        return $this->companies->contains('id', $companyId);
    }

    /**
     * Switch to a specific company context.
     */
    public function switchToCompany(int $companyId): bool
    {
        if ($this->hasAccessToCompany($companyId)) {
            session(['company_id' => $companyId]);
            return true;
        }
        
        return false;
    }

    /**
     * Get the follow-ups created by this user.
     */
    public function followUps()
    {
        return $this->hasMany(\Modules\Visitors\app\Models\FollowUp::class, 'followed_up_by');
    }

    /**
     * Scope a query to only include active users.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
