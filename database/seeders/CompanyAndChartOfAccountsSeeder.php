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

        // We'll create fresh companies without truncating

        // Create test companies directly using the DB facade
        $companyAId = DB::table('companies')->insertGetId([
            'name' => 'Company A',
            'display_name' => 'Company A, Inc.',
            'created_at' => now(),
            'updated_at' => now(),
            'data' => json_encode(['is_active' => true]),
        ]);

        $companyBId = DB::table('companies')->insertGetId([
            'name' => 'Company B',
            'display_name' => 'Company B, LLC',
            'created_at' => now(),
            'updated_at' => now(),
            'data' => json_encode(['is_active' => true]),
        ]);
        
        // Get model instances for the seeded companies
        $companyA = Company::find($companyAId);
        $companyB = Company::find($companyBId);
        
                // Associate user with both companies
        $user->companies()->attach($companyA->id, ['is_primary' => true]);
        $user->companies()->attach($companyB->id, ['is_primary' => false]);

        // Create chart of accounts for Company A
        $tenancy = app(Tenancy::class);
        $tenancy->initialize($companyA);

        ChartOfAccount::create([
            'company_id' => $companyA->id,
            'account_code' => '1000',
            'account_name' => 'Cash',
            'account_type' => 'Asset',
            'description' => 'Cash on hand',
            'is_active' => true,
        ]);

        ChartOfAccount::create([
            'company_id' => $companyA->id,
            'account_code' => '2000',
            'account_name' => 'Accounts Payable',
            'account_type' => 'Liability',
            'description' => 'Money owed to suppliers',
            'is_active' => true,
        ]);

        // End tenancy for Company A
        $tenancy->end();

        // Create chart of accounts for Company B
        $tenancy->initialize($companyB);

        ChartOfAccount::create([
            'company_id' => $companyB->id,
            'account_code' => 'B1000',
            'account_name' => 'Bank Account',
            'account_type' => 'Asset',
            'description' => 'Main bank account',
            'is_active' => true,
        ]);

        ChartOfAccount::create([
            'company_id' => $companyB->id,
            'account_code' => 'B3000',
            'account_name' => 'Equipment',
            'account_type' => 'Asset',
            'description' => 'Office equipment',
            'is_active' => true,
        ]);

        ChartOfAccount::create([
            'company_id' => $companyB->id,
            'account_code' => 'B5000',
            'account_name' => 'Revenue',
            'account_type' => 'Income',
            'description' => 'Main revenue account',
            'is_active' => true,
        ]);

        // End tenancy for Company B
        $tenancy->end();
    }
}
