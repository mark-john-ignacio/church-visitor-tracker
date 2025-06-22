<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class MenuItemsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create basic permissions
        $viewDashboardPerm = Permission::firstOrCreate(['name' => 'view_dashboard']);
        $viewAdminPerm = Permission::firstOrCreate(['name' => 'view_admin']);
        $manageUsersPerm = Permission::firstOrCreate(['name' => 'manage_users']);
        $manageRolesPerm = Permission::firstOrCreate(['name' => 'manage_roles']);
        $manageNavigationPerm = Permission::firstOrCreate(['name' => 'manage_navigation']);
        
        // Add Chart of Accounts permissions
        // $viewMasterfilesPerm = Permission::firstOrCreate(['name' => 'view_masterfiles']);
        // $viewAccountingSetupPerm = Permission::firstOrCreate(['name' => 'view_accounting_setup']);
        // $manageChartOfAccountsPerm = Permission::firstOrCreate(['name' => 'manage_chart_of_accounts']);
        // $manageBanksPerm = Permission::firstOrCreate(['name' => 'manage_banks']);

        // Create roles and assign permissions
        $superAdmin = Role::firstOrCreate(['name'=>'super_admin']);
        $superAdmin->givePermissionTo(Permission::all());

        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->givePermissionTo([
            $viewDashboardPerm, 
            $viewAdminPerm, 
            $manageUsersPerm, 
            // $viewMasterfilesPerm, 
            // $manageChartOfAccountsPerm, 
            // $viewAccountingSetupPerm
        ]);

        $user = Role::firstOrCreate(['name' => 'user']);
        $user->givePermissionTo('view_dashboard');

        // Create main nav items
        MenuItem::updateOrCreate(
            ['name' => 'Dashboard'],
            [
                'route' => '/dashboard',
                'icon' => 'LayoutGrid',
                'permission_name' => 'view_dashboard',
                'order' => 1,
                'type' => 'main'
            ]
        );

        // Create Masterfiles section
        // $masterfilesMenu = MenuItem::updateOrCreate(
        //     ['name' => 'Masterfiles'],
        //     [
        //         'route' => null,
        //         'icon' => 'Database',
        //         'permission_name' => 'view_masterfiles',
        //         'order' => 5,
        //         'type' => 'main'
        //     ]
        // );

        // $accountingSetupMenu = MenuItem::updateOrCreate(
        //     ['name' => 'Accounting','parent_id' => $masterfilesMenu->id],
        //     [
        //     'route' => null,
        //     'icon' => 'Calculator', 
        //     'permission_name' => 'view_accounting_setup',
        //     'order' => 1,
        //     'type' => 'main'
        //     ]
        // );

        // MenuItem::updateOrCreate(
        //     ['name' => 'Chart of Accounts', 'parent_id' => $accountingSetupMenu->id],
        //     [
        //         'route' => '/accounting-setup/chart-of-accounts',
        //         'icon' => 'BarChart2',
        //         'permission_name' => 'manage_chart_of_accounts',
        //         'order' => 1,
        //         'type' => 'main'
        //     ]
        // );

        // MenuItem::updateOrCreate(
        //     ['name' => 'Banks', 'parent_id' => $accountingSetupMenu->id],
        //     [
        //         'route' => '/accounting-setup/banks',
        //         'icon' => 'CreditCard',
        //         'permission_name' => 'manage_banks',
        //         'order' => 2,
        //         'type' => 'main'
        //     ]
        // );

        // Create admin section
        $adminMenu = MenuItem::updateOrCreate(
            ['name' => 'Administration'],
            [
                'route' => '/admin',
                'icon' => 'Settings',
                'permission_name' => 'view_admin',
                'order' => 10,
                'type' => 'main'
            ]
        );

        MenuItem::updateOrCreate(
            ['name' => 'User Management', 'parent_id' => $adminMenu->id],
            [
                'route' => '/admin/users',
                'icon' => 'Users',
                'permission_name' => 'manage_users',
                'order' => 1,
                'type' => 'main'
            ]
        );

        MenuItem::updateOrCreate(
            ['name' => 'Role & Permissions', 'parent_id' => $adminMenu->id],
            [
                'route' => '/admin/roles',
                'icon' => 'Shield',
                'permission_name' => 'manage_roles',
                'order' => 2,
                'type' => 'main'
            ]
        );

        MenuItem::updateOrCreate(
            ['name' => 'Navigation Management', 'parent_id' => $adminMenu->id],
            [
                'route' => '/admin/navigation',
                'icon' => 'Menu',
                'permission_name' => 'manage_navigation',
                'order' => 3,
                'type' => 'main'
            ]
        );

        MenuItem::updateOrCreate(
            ['name' => 'Permissions', 'parent_id' => $adminMenu->id],
            [
                'route' => '/admin/permissions',
                'icon' => 'Key',
                'permission_name' => 'manage_roles',
                'order' => 4,
                'type' => 'main'
            ]
        );

        // Create footer items
        MenuItem::updateOrCreate(
            ['name' => 'Documentation'],
            [
                'route' => 'https://laravel.com/docs/starter-kits',
                'icon' => 'BookOpen',
                'order' => 1,
                'type' => 'footer'
            ]
        );
    }
}