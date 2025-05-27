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

    // Constants for account categories
    public const CATEGORY_ASSET = 'ASSET';
    public const CATEGORY_LIABILITY = 'LIABILITY';
    public const CATEGORY_EQUITY = 'EQUITY';
    public const CATEGORY_REVENUE = 'REVENUE';
    public const CATEGORY_COST_OF_SALES = 'COST OF SALES';
    public const CATEGORY_EXPENSES = 'EXPENSES';

    // Constants for account types (formerly nature)
    public const TYPE_GENERAL = 'General';
    public const TYPE_DETAIL = 'Detail';
    public const MAX_LEVEL = 5;
    public const MIN_LEVEL = 1;

    // Define sortable columns
    public const SORTABLE_COLUMNS = [
        'account_code',
        'account_name', 
        'account_category',
        'account_type',
        'level',
        'created_at',
        'is_active'
    ];

    protected $fillable = [
        'company_id',
        'account_code',
        'account_name',
        'account_category', // Changed from account_type
        'account_type',     // Changed from account_nature
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
        return $query->where('account_type', self::TYPE_GENERAL);
    }

    public function scopeDetail(Builder $query): Builder
    {
        return $query->where('account_type', self::TYPE_DETAIL);
    }

    public function scopeByCategory(Builder $query, string $category): Builder
    {
        return $query->where('account_category', $category);
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
              ->orWhere('account_category', 'like', "%{$search}%")
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
        return $this->account_type === self::TYPE_GENERAL;
    }

    public function isDetail(): bool
    {
        return $this->account_type === self::TYPE_DETAIL;
    }

    public function hasSubAccounts(): bool
    {
        return $this->subAccounts()->exists();
    }

    public function canBeDeleted(): bool
    {
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

    public static function getAvailableCategories(): array
    {
        return [
            self::CATEGORY_ASSET,
            self::CATEGORY_LIABILITY,
            self::CATEGORY_EQUITY,
            self::CATEGORY_REVENUE,
            self::CATEGORY_COST_OF_SALES,
            self::CATEGORY_EXPENSES,
        ];
    }

    public static function getAvailableTypes(): array
    {
        return [
            self::TYPE_GENERAL,
            self::TYPE_DETAIL,
        ];
    }

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory()
    {
        return \Modules\AccountingSetup\Database\Factories\ChartOfAccountFactory::new();
    }
}