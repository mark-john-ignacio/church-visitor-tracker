import type { SortDirection } from '@/components/CRUD-index';
import { CrudIndex } from '@/components/CRUD-index';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, LaravelPaginator, PageProps, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';

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
    const handleDelete = useCallback((id: number) => {
        router.delete(route('admin.users.destroy', id), {});
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
            rows.map((u) => (
                <Card key={u.id} className="border">
                    <CardContent className="space-y-1">
                        <p>
                            <strong>Name:</strong> {u.name}
                        </p>
                        <p>
                            <strong>Email:</strong> {u.email}
                        </p>
                        {(u.roles ?? []).length > 0 && (
                            <p className="flex flex-wrap gap-1">
                                {(u.roles ?? []).map((r) => (
                                    <Badge key={r.name}>{r.name}</Badge>
                                ))}
                            </p>
                        )}
                        <p className="text-muted-foreground text-xs">Joined: {new Date(u.created_at).toLocaleDateString()}</p>
                        <div className="flex justify-end gap-2">
                            <Button asChild size="sm" variant="outline">
                                <Link href={route('admin.users.edit', u.id)}>Edit</Link>
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(u.id)} aria-label={`Delete user ${u.name}`}>
                                Delete
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )),
        [],
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
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
