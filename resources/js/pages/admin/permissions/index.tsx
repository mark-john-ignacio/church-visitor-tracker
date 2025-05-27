import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type LaravelPaginator, type PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { permissionColumns, type Permission } from './components/columns';

interface PermissionsPageProps extends PageProps {
    permissions: LaravelPaginator<Permission>;
    filters?: {
        search?: string;
        sort?: string;
        order?: string;
    };
}

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Admin', href: '#' },
    { title: 'Permissions', href: route('admin.permissions.index') },
];

export default function PermissionsIndex({ permissions, filters }: PermissionsPageProps) {
    // Custom delete confirmation message function
    const getDeleteConfirmationMessage = (permission: Permission) => {
        const systemPermissions = [
            'view_dashboard',
            'view_admin',
            'manage_users',
            'manage_roles',
            'manage_permissions',
            'manage_navigation',
            'view_masterfiles',
            'view_accounting_setup',
            'manage_chart_of_accounts',
            'manage_banks',
        ];

        if (systemPermissions.includes(permission.name)) {
            return 'System permissions cannot be deleted as they are required for the application to function properly.';
        }

        return `Are you sure you want to delete the permission "${permission.name}"? This action cannot be undone and will affect all roles that have this permission assigned.`;
    };

    // Transform Laravel pagination to our table format
    const paginationInfo = {
        pageIndex: permissions.current_page - 1, // Convert to 0-based index
        pageSize: permissions.per_page,
        pageCount: permissions.last_page,
        total: permissions.total,
    };

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Permissions Management" />

            <div className="p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <CardTitle>Permissions Management</CardTitle>
                                <CardDescription>
                                    Manage the permissions that can be assigned to roles. System permissions cannot be modified.
                                </CardDescription>
                            </div>
                            <Button asChild>
                                <Link href={route('admin.permissions.create')}>Create Permission</Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <DataTable
                            columns={permissionColumns}
                            data={permissions.data}
                            searchColumn="name"
                            searchPlaceholder="Filter permissions..."
                            tableKey="permissions"
                            getDeleteConfirmationMessage={getDeleteConfirmationMessage}
                            serverSide={true}
                            pagination={paginationInfo}
                            filters={filters}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
