<?php

namespace Database\Seeders;

use App\Models\ChartOfAccount;
use App\Models\Company;
use App\Models\User;
use App\Models\UserCompany;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Stancl\Tenancy\Tenancy;

class CompanyAndChartOfAccountsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user if it doesn't exist
        $user = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $user->assignRole('super_admin');

    $companyA = Company::where('name', 'Company A')->first();
    if (!$companyA) {
        $companyAId = DB::table('companies')->insertGetId([
            'name' => 'Company A',
            'display_name' => 'Company A, Inc.',
            'data' => json_encode(['is_active' => true]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $companyA = Company::find($companyAId);
        
        // Only attach user if the company was newly created
        $user->companies()->attach($companyA->id, ['is_primary' => true]);
    }

    // Check if Company B exists before creating it
    $companyB = Company::where('name', 'Company B')->first();
    if (!$companyB) {
        $companyBId = DB::table('companies')->insertGetId([
            'name' => 'Company B',
            'display_name' => 'Company B, LLC',
            'data' => json_encode(['is_active' => true]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $companyB = Company::find($companyBId);
        
        // Only attach user if the company was newly created
        $user->companies()->attach($companyB->id, ['is_primary' => false]);
    }
        

        // Create chart of accounts for Company A
        $tenancy = app(Tenancy::class);
        $tenancy->initialize($companyA);

        if (!ChartOfAccount::where('account_code', '1000')->exists()) {
            ChartOfAccount::create([
                'company_id' => $companyA->id,
                'account_code' => '1000',
                'account_name' => 'Assets (General)',
                'account_type' => 'Asset',
                'account_nature' => 'General', 
                'is_contra_account' => false, 
                'level' => 1, 
                'header_account_id' => null,
                'description' => 'Main asset group',
                'is_active' => true,
            ]);
        }

        if (!ChartOfAccount::where('account_code', '2000')->exists()) {
            ChartOfAccount::create([
                'company_id' => $companyA->id,
                'account_code' => '1100',
                'account_name' => 'Cash', // Example: Level 2 Detail Account under '1000'
                'account_type' => 'Asset',
                'account_nature' => 'Detail', // New
                'is_contra_account' => false, // New
                'level' => 2, // New
                'header_account_id' => ChartOfAccount::where('company_id', $companyA->id)->where('account_code', '1000')->first()->id, // New
                'description' => 'Cash on hand and in bank',
                'is_active' => true,
            ]);
        }

        // End tenancy for Company A
        $tenancy->end();

        // Create chart of accounts for Company B
        $tenancy->initialize($companyB);

        if (!ChartOfAccount::where('account_code', 'B1000')->exists()) {
            ChartOfAccount::create([
                'company_id' => $companyB->id,
                'account_code' => 'B1000',
                'account_name' => 'Bank Account',
                'account_type' => 'Asset',
                'account_nature' => 'General',
                'is_contra_account' => false, 
                'level' => 1,
                'header_account_id' => null,
                'description' => 'Main bank account',
                'is_active' => true,
            ]);
        }

        if (!ChartOfAccount::where('account_code', 'B3000')->exists()) {
            ChartOfAccount::create([
                'company_id' => $companyB->id,
                'account_code' => 'B3000',
                'account_name' => 'Equipment',
                'account_type' => 'Asset',
                'account_nature' => 'Detail',
                'is_contra_account' => false,
                'level' => 2,
                'header_account_id' => ChartOfAccount::where('company_id', $companyB->id)->where('account_code', 'B1000')->first()->id, // New,
                'description' => 'Office equipment',
                'is_active' => true,
            ]);
        }
        ChartOfAccount::create([
            'company_id' => $companyB->id,
            'account_code' => 'B5000',
            'account_name' => 'Revenue',
            'account_type' => 'Income',
            'account_nature' => 'Detail',
            'is_contra_account' => false,
            'level' => 2,
            'header_account_id' => ChartOfAccount::where('company_id', $companyB->id)->where('account_code', 'B1000')->first()->id,
            'description' => 'Main revenue account',
            'is_active' => true,
        ]);

        // End tenancy for Company B
        $tenancy->end();
    }
}
