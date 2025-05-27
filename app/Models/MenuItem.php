<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class MenuItem extends Model implements Auditable
{
    use HasFactory, AuditableTrait;

    // Constants for menu types
    public const TYPE_MAIN = 'main';
    public const TYPE_FOOTER = 'footer';
    public const TYPE_USER = 'user';

    // Sortable columns for DataTable
    public const SORTABLE_COLUMNS = [
        'name',
        'route',
        'icon',
        'type',
        'order',
        'created_at',
        'updated_at'
    ];

    /**
     * Attributes mass assignable
     */
    protected $fillable = [
        'name',
        'route',
        'icon',
        'permission_name',
        'parent_id',
        'order',
        'type'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'order' => 'integer',
        'parent_id' => 'integer',
    ];

    /**
     * Get the parent menu item if this is a submenu
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class, 'parent_id');
    }

    /**
     * Get child menu items
     */
    public function children(): HasMany
    {
        return $this->hasMany(MenuItem::class, 'parent_id')->orderBy('order');
    }

    // ===== SCOPES =====

    /**
     * Scope for searching menu items
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (empty($search)) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('route', 'like', "%{$search}%")
              ->orWhere('icon', 'like', "%{$search}%")
              ->orWhere('permission_name', 'like', "%{$search}%");
        });
    }

    /**
     * Scope for ordering by default (type then order)
     */
    public function scopeDefaultOrder(Builder $query): Builder
    {
        return $query->orderBy('type')->orderBy('order');
    }

    /**
     * Scope for getting main navigation items
     */
    public function scopeMain(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_MAIN);
    }

    /**
     * Scope for getting footer navigation items
     */
    public function scopeFooter(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_FOOTER);
    }

    /**
     * Scope for getting user menu navigation items
     */
    public function scopeUser(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_USER);
    }

    /**
     * Scope for getting top-level items (no parent)
     */
    public function scopeTopLevel(Builder $query): Builder
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope for getting child items (has parent)
     */
    public function scopeChildren(Builder $query): Builder
    {
        return $query->whereNotNull('parent_id');
    }

    /**
     * Scope for items by type
     */
    public function scopeByType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    // ===== HELPER METHODS =====

    /**
     * Check if this menu item has children
     */
    public function hasChildren(): bool
    {
        return $this->children()->exists();
    }

    /**
     * Check if this is a top-level item
     */
    public function isTopLevel(): bool
    {
        return is_null($this->parent_id);
    }

    /**
     * Check if this is a child item
     */
    public function isChild(): bool
    {
        return !is_null($this->parent_id);
    }

    /**
     * Get the full hierarchy path
     */
    public function getHierarchyPath(): string
    {
        if ($this->isTopLevel()) {
            return $this->name;
        }

        return $this->parent->name . ' > ' . $this->name;
    }

    /**
     * Check if this item can be deleted
     */
    public function canBeDeleted(): bool
    {
        return !$this->hasChildren();
    }

    // ===== STATIC METHODS =====

    /**
     * Get available menu types
     */
    public static function getAvailableTypes(): array
    {
        return [
            self::TYPE_MAIN => 'Main Navigation',
            self::TYPE_FOOTER => 'Footer',
            self::TYPE_USER => 'User Menu',
        ];
    }

    /**
     * Get eligible parent items (excludes the current item and its descendants)
     */
    public static function getEligibleParents(?int $excludeId = null): \Illuminate\Database\Eloquent\Collection
    {
        return static::topLevel()
            ->when($excludeId, fn($query) => $query->where('id', '!=', $excludeId))
            ->defaultOrder()
            ->get();
    }

    /**
     * Get available icons list
     */
    public static function getAvailableIcons(): array
    {
        return [
            'LayoutGrid' => 'Layout Grid',
            'Users' => 'Users',
            'Settings' => 'Settings',
            'ChartBar' => 'Chart Bar',
            'FileText' => 'File Text',
            'Wallet' => 'Wallet',
            'CreditCard' => 'Credit Card',
            'Shield' => 'Shield',
            'Bell' => 'Bell',
            'BookOpen' => 'Book Open',
            'Folder' => 'Folder',
            'Menu' => 'Menu',
            'Key' => 'Key',
            'Landmark' => 'Landmark',
            'Banknote' => 'Banknote',
            'Clipboard' => 'Clipboard',
            'BarChart' => 'Bar Chart',
            'LineChart' => 'Line Chart',
            'PieChart' => 'Pie Chart',
            'Building' => 'Building',
            'CircleDollarSign' => 'Circle Dollar Sign',
        ];
    }

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory()
    {
        return \Database\Factories\MenuItemFactory::new();
    }
}