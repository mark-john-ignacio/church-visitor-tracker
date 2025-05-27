import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type LaravelPaginator, type PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { roleColumns, type Role } from './components/columns';

interface RolesPageProps extends PageProps {
    roles: LaravelPaginator<Role>;
    filters?: {
        search?: string;
        sort?: string;
        order?: string;
    };
}

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Admin', href: '#' },
    { title: 'Roles & Permissions', href: route('admin.roles.index') },
];

export default function RolesIndex({ roles, filters }: RolesPageProps) {
    // Custom delete confirmation message function
    const getDeleteConfirmationMessage = (role: Role) => {
        if (role.name === 'super_admin') {
            return 'Super Admin role cannot be deleted as it is a system role.';
        }
        return `Are you sure you want to delete the role "${role.name}"? This will remove the role from all users who have it assigned. This action cannot be undone.`;
    };

    // Transform Laravel pagination to our table format
    const paginationInfo = {
        pageIndex: roles.current_page - 1, // Convert to 0-based index
        pageSize: roles.per_page,
        pageCount: roles.last_page,
        total: roles.total,
    };

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Roles & Permissions Management" />

            <div className="p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <CardTitle>Roles & Permissions Management</CardTitle>
                                <CardDescription>Manage roles and their associated permissions.</CardDescription>
                            </div>
                            <Button asChild>
                                <Link href={route('admin.roles.create')}>Create Role</Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <DataTable
                            columns={roleColumns}
                            data={roles.data}
                            searchColumn="name"
                            searchPlaceholder="Filter roles..."
                            tableKey="roles"
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
