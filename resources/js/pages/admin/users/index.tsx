import type { SortDirection } from '@/components/data-table';
import { CrudIndex } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, LaravelPaginator, PageProps, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';

interface UsersPageProps extends PageProps {
    users: LaravelPaginator<User>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '#' },
    { title: 'Users', href: route('admin.users.index') },
];

// Extract columns for better type inference and readability
const userColumns = [
    { label: 'Name', key: 'name', sortable: true },
    { label: 'Email', key: 'email', sortable: true },
    {
        label: 'Roles',
        key: 'roles',
        render: (u: User) =>
            (u.roles ?? []).map((r) => (
                <Badge key={r.name} variant="secondary" className="mr-1">
                    {r.name}
                </Badge>
            )),
    },
    {
        label: 'Joined',
        key: 'created_at',
        sortable: true,
        render: (u: User) => new Date(u.created_at).toLocaleDateString(),
    },
];

export default function UserManagementIndex({ auth, users }: UsersPageProps) {
    const isSuperAdmin = (user: User) => {
        return (user.roles ?? []).some((r) => r.name === 'super_admin');
    };

    const handleDelete = useCallback((id: number) => {
        router.delete(route('admin.users.destroy', id), {
            onSuccess: () => {
                toast.success('User deleted successfully');
            },
            onError: (errors) => {
                if (errors.default) {
                    toast.error(errors.default);
                } else {
                    toast.error('Failed to delete user');
                }
            },
        });
    }, []);

    const handleSearch = useCallback((searchTerm: string) => {
        router.get(
            route('admin.users.index'),
            { search: searchTerm },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, []);

    const handleSort = useCallback((column: string, direction: SortDirection) => {
        router.get(
            route('admin.users.index'),
            {
                sort: column,
                order: direction,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, []);

    const renderMobile = useMemo(
        () => (rows: User[]) =>
            rows.map((u) => {
                const userIsSuperAdmin = isSuperAdmin(u);

                return (
                    <Card key={u.id} className="border">
                        <CardContent className="space-y-1 p-4">
                            <div className="flex items-center gap-2">
                                <p className="font-medium">{u.name}</p>
                                {userIsSuperAdmin && <Badge variant="destructive">Super Admin</Badge>}
                            </div>
                            <p>
                                <strong>Email:</strong> {u.email}
                            </p>
                            {(u.roles ?? []).length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    <strong>Roles:</strong>
                                    <div className="flex flex-wrap gap-1">
                                        {(u.roles ?? []).map((r) => (
                                            <Badge key={r.name} variant={r.name === 'super_admin' ? 'destructive' : 'secondary'}>
                                                {r.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <p className="text-muted-foreground text-xs">Joined: {new Date(u.created_at).toLocaleDateString()}</p>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button asChild size="sm" variant="outline">
                                    <Link href={route('admin.users.edit', u.id)}>{userIsSuperAdmin && u.id !== auth.user.id ? 'View' : 'Edit'}</Link>
                                </Button>
                                {!userIsSuperAdmin && (
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(u.id)} aria-label={`Delete user ${u.name}`}>
                                        Delete
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            }),
        [auth.user?.id],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>Manage application users and their roles.</CardDescription>
                        <div className="flex justify-end gap-2">
                            <Button asChild size="sm">
                                <Link href={route('admin.users.create')}>Create User</Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <CrudIndex
                            resource="users"
                            rows={users.data}
                            columns={userColumns}
                            renderMobile={renderMobile}
                            onDelete={handleDelete}
                            paginator={users}
                            searchable={true}
                            onSearch={handleSearch}
                            onSort={handleSort}
                            canDelete={(user) => !isSuperAdmin(user)}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
