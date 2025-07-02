<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Visitor permissions
            'view_visitors',
            'create_visitors',
            'edit_visitors',
            'delete_visitors',
            'export_visitors',

            // Follow-up permissions
            'view_followups',
            'create_followups',
            'edit_followups',
            'delete_followups',

            // Dashboard permissions
            'view_dashboard',
            'export_dashboard',

            // Admin permissions
            'manage_users',
            'manage_roles',
            'manage_permissions',
            'manage_navigation',
            'manage_companies',

            // System permissions
            'view_audit_logs',
            'manage_settings',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles and assign permissions
        $superAdminRole = Role::firstOrCreate(['name' => 'Super Admin']);
        $superAdminRole->syncPermissions(Permission::all());

        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $adminRole->syncPermissions([
            'view_dashboard',
            'view_visitors',
            'create_visitors',
            'edit_visitors',
            'delete_visitors',
            'export_visitors',
            'view_followups',
            'create_followups',
            'edit_followups',
            'delete_followups',
            'manage_users',
            'view_audit_logs',
        ]);

        $staffRole = Role::firstOrCreate(['name' => 'Staff']);
        $staffRole->syncPermissions([
            'view_dashboard',
            'view_visitors',
            'create_visitors',
            'edit_visitors',
            'view_followups',
            'create_followups',
            'edit_followups',
        ]);

        $volunteerRole = Role::firstOrCreate(['name' => 'Volunteer']);
        $volunteerRole->syncPermissions([
            'view_dashboard',
            'view_visitors',
            'create_visitors',
            'view_followups',
            'create_followups',
        ]);

        $viewerRole = Role::firstOrCreate(['name' => 'Viewer']);
        $viewerRole->syncPermissions([
            'view_dashboard',
            'view_visitors',
            'view_followups',
        ]);
    }
}
