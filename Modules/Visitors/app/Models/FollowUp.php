<?php

namespace Modules\Visitors\Models;

use App\Models\User;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class FollowUp extends Model implements Auditable
{
    use HasFactory, BelongsToCompany, AuditableTrait;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'company_id',
        'visitor_id',
        'followed_up_by',
        'status',
        'method',
        'notes',
        'scheduled_at',
        'completed_at',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Get the visitor that owns the follow-up.
     */
    public function visitor(): BelongsTo
    {
        return $this->belongsTo(\Modules\Visitors\Models\Visitor::class);
    }

    /**
     * Get the user who performed the follow-up.
     */
    public function followedUpBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'followed_up_by');
    }

    /**
     * Scope a query to only include pending follow-ups.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include completed follow-ups.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to filter by status.
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to filter by method.
     */
    public function scopeMethod($query, $method)
    {
        return $query->where('method', $method);
    }

    /**
     * Scope a query to filter by follow-up user.
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('followed_up_by', $userId);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeCreatedBetween($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Mark the follow-up as completed.
     */
    public function markAsCompleted(string $notes = null): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
            'notes' => $notes ?: $this->notes,
        ]);
    }

    /**
     * Check if the follow-up is overdue.
     */
    public function isOverdue(): bool
    {
        return $this->scheduled_at && 
               $this->scheduled_at->isPast() && 
               !in_array($this->status, ['completed', 'not_interested']);
    }

    /**
     * Get the status with a human-readable label.
     */
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'pending' => 'Pending',
            'contacted' => 'Contacted',
            'scheduled' => 'Scheduled',
            'completed' => 'Completed',
            'no_response' => 'No Response',
            'not_interested' => 'Not Interested',
            default => ucfirst($this->status),
        };
    }

    /**
     * Get the method with a human-readable label.
     */
    public function getMethodLabelAttribute(): string
    {
        return match($this->method) {
            'phone' => 'Phone Call',
            'email' => 'Email',
            'text' => 'Text Message',
            'in_person' => 'In Person',
            'mail' => 'Mail',
            default => ucfirst($this->method),
        };
    }

    /**
     * Get available status options.
     */
    public static function getStatusOptions(): array
    {
        return [
            'pending' => 'Pending',
            'contacted' => 'Contacted',
            'scheduled' => 'Scheduled',
            'completed' => 'Completed',
            'no_response' => 'No Response',
            'not_interested' => 'Not Interested',
        ];
    }

    /**
     * Get available method options.
     */
    public static function getMethodOptions(): array
    {
        return [
            'phone' => 'Phone Call',
            'email' => 'Email',
            'text' => 'Text Message',
            'in_person' => 'In Person',
            'mail' => 'Mail',
        ];
    }
}
