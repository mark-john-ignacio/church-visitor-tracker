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
            'slug' => 'company-a',
            'display_name' => 'Company A, Inc.',
            'email' => 'admin@companya.com',
            'phone' => '(555) 000-0001',
            'address' => '123 Business St, City, State 12345',
            'is_active' => true,
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
            'slug' => 'company-b',
            'display_name' => 'Company B, LLC',
            'email' => 'admin@companyb.com',
            'phone' => '(555) 000-0002',
            'address' => '456 Corporate Ave, City, State 12345',
            'is_active' => true,
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
            ChartOfAccount::factory()->topLevel()
                ->general()
                ->asset()
                ->create([
                    'company_id' => $companyA->id,
                    'account_code' => '1000',
                    'account_name' => 'Assets',
                    'description' => 'All assets of the company',
                    'is_active' => true,
                ]);
        }

        if (!ChartOfAccount::where('account_code', '2000')->exists()) {
            $headerAccount = ChartOfAccount::where('company_id', $companyA->id)
                ->where('account_code', '1000')
                ->first();
                
            if ($headerAccount) {
                ChartOfAccount::factory()->detail()
                    ->asset()
                    ->create([
                        'company_id' => $companyA->id,
                        'account_code' => '2000',
                        'account_name' => 'Cash',
                        'header_account_id' => $headerAccount->id,
                        'description' => 'Cash on hand and in bank',
                        'is_active' => true,
                    ]);
            }
        }

        // End tenancy for Company A
        $tenancy->end();

        // Create chart of accounts for Company B
        $tenancy->initialize($companyB);

        if (!ChartOfAccount::where('account_code', 'B1000')->exists()) {
            ChartOfAccount::factory()->topLevel()
                ->general()
                ->asset()
                ->create([
                    'company_id' => $companyB->id,
                    'account_code' => 'B1000',
                    'account_name' => 'Assets',
                    'description' => 'All assets of Company B',
                    'is_active' => true,
                ]);
        }

        if (!ChartOfAccount::where('account_code', 'B3000')->exists()) {
            $headerAccount = ChartOfAccount::where('company_id', $companyB->id)
                ->where('account_code', 'B1000')
                ->first();
                
            if ($headerAccount) {
                ChartOfAccount::factory()->detail()
                    ->asset()
                    ->create([
                        'company_id' => $companyB->id,
                        'account_code' => 'B3000',
                        'account_name' => 'Accounts Receivable',
                        'header_account_id' => $headerAccount->id,
                        'description' => 'Money owed by customers',
                        'is_active' => true,
                    ]);
            }
        }
        if (!ChartOfAccount::where('account_code', 'B5000')->exists()) {
            $headerAccount = ChartOfAccount::where('company_id', $companyB->id)
                ->where('account_code', 'B1000')
                ->first();
                
            if ($headerAccount) {
                ChartOfAccount::factory()->detail()
                    ->revenue()
                    ->create([
                        'company_id' => $companyB->id,
                        'account_code' => 'B5000',
                        'account_name' => 'Sales Revenue',
                        'header_account_id' => $headerAccount->id,
                        'description' => 'Revenue from sales',
                        'is_active' => true,
                    ]);
            }
        }

        // End tenancy for Company B
        $tenancy->end();
    }
}
