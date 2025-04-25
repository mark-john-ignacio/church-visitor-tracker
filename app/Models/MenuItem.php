<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class MenuItem extends Model implements Auditable
{
    use HasFactory, AuditableTrait;

    /*
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
     * Get the parent menu item if this is a submenu
     */
    public function parent():BelongsTo
    {
        return $this->belongsTo(MenuItem::class, 'parent_id');
    }

    public function children():HasMany
    {
        return $this->hasMany(MenuItem::class, 'parent_id')->orderBy('order');
    }

}
