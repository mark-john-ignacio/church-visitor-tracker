import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type LaravelPaginator, type PageProps, type User } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { userColumns } from './components/columns';

interface UsersPageProps extends PageProps {
    users: LaravelPaginator<User>;
    filters?: {
        search?: string;
        sort?: string;
        order?: string;
    };
}

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Admin', href: '#' },
    { title: 'Users', href: route('admin.users.index') },
];

export default function UserManagementIndex({ users, filters }: UsersPageProps) {
    // Custom delete confirmation message function
    const getDeleteConfirmationMessage = (user: User) => {
        return `Are you sure you want to delete the user "${user.name}"? This action cannot be undone and will remove all associated data.`;
    };

    // Transform Laravel pagination to our table format
    const paginationInfo = {
        pageIndex: users.current_page - 1, // Convert to 0-based index
        pageSize: users.per_page,
        pageCount: users.last_page,
        total: users.total,
    };

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="User Management" />

            <div className="p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <CardTitle>User Management</CardTitle>
                                <CardDescription>Manage application users and their roles.</CardDescription>
                            </div>
                            <Button asChild>
                                <Link href={route('admin.users.create')}>Create User</Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <DataTable
                            columns={userColumns}
                            data={users.data}
                            searchColumn="name"
                            searchPlaceholder="Filter users..."
                            tableKey="users"
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
