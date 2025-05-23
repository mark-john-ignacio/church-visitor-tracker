<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Datebase\Eloquent\Relations\HasMany;

class ChartOfAccount extends Model
{
    use HasFactory;
    use BelongsToCompany; // Using our custom trait instead of BelongsToTenant
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
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
    
    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'is_contra_account' => 'boolean',
        'level' => 'integer',
    ];
    
    public function headerAccount():BelongsTo
    {
        return $this->belongsTo(ChartofAccount::class, 'header_account_id');
    }

    public function subAccounts(): HasMany{
        return $this->hasMany(ChartOfAccount::class, 'header_account_id');
    }
}
