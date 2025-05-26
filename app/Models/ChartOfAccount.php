<?php
namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChartOfAccount extends Model
{
    use HasFactory, BelongsToCompany;

    // Constants
    public const NATURE_GENERAL = 'General';
    public const NATURE_DETAIL = 'Detail';
    public const MAX_LEVEL = 5;
    public const MIN_LEVEL = 1;

    protected $fillable = [
        'company_id',
        'account_code',
        'account_name',
        'account_type',
        'account_nature',
        'is_contra_account',
        'level',
        'header_account_id',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_contra_account' => 'boolean',
        'level' => 'integer',
    ];

    protected $with = ['headerAccount'];

    // Relationships
    public function headerAccount(): BelongsTo
    {
        return $this->belongsTo(self::class, 'header_account_id');
    }

    public function subAccounts(): HasMany
    {
        return $this->hasMany(self::class, 'header_account_id');
    }

    // Scopes
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeGeneral(Builder $query): Builder
    {
        return $query->where('account_nature', self::NATURE_GENERAL);
    }

    public function scopeDetail(Builder $query): Builder
    {
        return $query->where('account_nature', self::NATURE_DETAIL);
    }

    public function scopeTopLevel(Builder $query): Builder
    {
        return $query->where('level', self::MIN_LEVEL);
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (empty($search)) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($search) {
            $q->where('account_code', 'like', "%{$search}%")
              ->orWhere('account_name', 'like', "%{$search}%")
              ->orWhere('account_type', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }

    public function scopeOrderByCode(Builder $query): Builder
    {
        return $query->orderBy('account_code');
    }

    // Accessors & Mutators
    public function getFullCodeNameAttribute(): string
    {
        return "{$this->account_code} - {$this->account_name}";
    }

    // Helper Methods
    public function isTopLevel(): bool
    {
        return $this->level === self::MIN_LEVEL;
    }

    public function isGeneral(): bool
    {
        return $this->account_nature === self::NATURE_GENERAL;
    }

    public function isDetail(): bool
    {
        return $this->account_nature === self::NATURE_DETAIL;
    }

    public function hasSubAccounts(): bool
    {
        return $this->subAccounts()->exists();
    }

    public function canBeDeleted(): bool
    {
        // Add business logic for when an account can be deleted
        return !$this->hasSubAccounts() && $this->is_active;
    }

    public static function getEligibleHeaderAccounts(int $companyId, ?int $excludeId = null): \Illuminate\Database\Eloquent\Collection
    {
        return static::where('company_id', $companyId)
            ->general()
            ->when($excludeId, fn($query) => $query->where('id', '!=', $excludeId))
            ->orderByCode()
            ->get();
    }
}