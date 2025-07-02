<?php

namespace Modules\Visitors\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class Visitor extends Model implements Auditable
{
    use HasFactory, BelongsToCompany, AuditableTrait;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'company_id',
        'name',
        'email',
        'phone',
        'address',
        'visit_date',
        'invited_by',
        'tags',
        'notes',
        'service_type',
        'is_first_time',
        'age_group',
        'how_did_you_hear',
        'wants_followup',
        'wants_newsletter',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'visit_date' => 'date',
        'tags' => 'array',
        'is_first_time' => 'boolean',
        'wants_followup' => 'boolean',
        'wants_newsletter' => 'boolean',
    ];

    /**
     * Get the follow-ups for this visitor.
     */
    public function followUps(): HasMany
    {
        return $this->hasMany(\Modules\Visitors\Models\FollowUp::class);
    }

    /**
     * Get the latest follow-up for this visitor.
     */
    public function latestFollowUp(): BelongsTo
    {
        return $this->belongsTo(FollowUp::class, 'id', 'visitor_id')
            ->latest();
    }

    /**
     * Scope a query to only include first-time visitors.
     */
    public function scopeFirstTime($query)
    {
        return $query->where('is_first_time', true);
    }

    /**
     * Scope a query to only include visitors who want follow-up.
     */
    public function scopeWantsFollowup($query)
    {
        return $query->where('wants_followup', true);
    }

    /**
     * Scope a query to filter by visit date range.
     */
    public function scopeVisitedBetween($query, $startDate, $endDate)
    {
        return $query->whereBetween('visit_date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to filter by service type.
     */
    public function scopeServiceType($query, $serviceType)
    {
        return $query->where('service_type', $serviceType);
    }

    /**
     * Scope a query to filter by age group.
     */
    public function scopeAgeGroup($query, $ageGroup)
    {
        return $query->where('age_group', $ageGroup);
    }

    /**
     * Get the full name with email if available.
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->email ? "{$this->name} ({$this->email})" : $this->name;
    }

    /**
     * Get the formatted phone number.
     */
    public function getFormattedPhoneAttribute(): ?string
    {
        if (!$this->phone) {
            return null;
        }

        // Basic phone formatting - you can enhance this
        $phone = preg_replace('/[^0-9]/', '', $this->phone);
        
        if (strlen($phone) === 10) {
            return sprintf('(%s) %s-%s',
                substr($phone, 0, 3),
                substr($phone, 3, 3),
                substr($phone, 6, 4)
            );
        }

        return $this->phone;
    }

    /**
     * Check if this visitor has pending follow-ups.
     */
    public function hasPendingFollowUps(): bool
    {
        return $this->followUps()->where('status', 'pending')->exists();
    }
}
