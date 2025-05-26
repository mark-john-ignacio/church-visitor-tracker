import type { SortDirection } from '@/components/CRUD-index';
import { CrudIndex } from '@/components/CRUD-index';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, LaravelPaginator, PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';

interface Permission {
    id: number;
    name: string;
    created_at: string;
}

interface PermissionsPageProps extends PageProps {
    permissions: LaravelPaginator<Permission>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '#' },
    { title: 'Permissions', href: route('admin.permissions.index') },
];

// System permissions that shouldn't be edited or deleted
const systemPermissions = ['view_dashboard', 'view_admin', 'manage_users', 'manage_roles', 'manage_permissions', 'manage_navigation'];

const isSystemPermission = (name: string) => systemPermissions.includes(name);

const permissionColumns = [
    { label: 'Name', key: 'name', sortable: true },
    {
        label: 'Created At',
        key: 'created_at',
        sortable: true,
        render: (p: Permission) => new Date(p.created_at).toLocaleDateString(),
    },
];

export default function PermissionsIndex({ permissions }: PermissionsPageProps) {
    const handleDelete = useCallback((id: number) => {
        router.delete(route('admin.permissions.destroy', id), {});
    }, []);

    const handleSearch = useCallback((searchTerm: string) => {
        router.get(
            route('admin.permissions.index'),
            { search: searchTerm },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, []);

    const handleSort = useCallback((column: string, direction: SortDirection) => {
        router.get(
            route('admin.permissions.index'),
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
        () => (rows: Permission[]) =>
            rows.map((p) => (
                <Card key={p.id} className="border">
                    <CardContent className="space-y-1">
                        <p>
                            <strong>Name:</strong> {p.name}
                        </p>
                        <p className="text-muted-foreground text-xs">Created: {new Date(p.created_at).toLocaleDateString()}</p>
                        <div className="flex justify-end gap-2">
                            <Button asChild size="sm" variant="outline">
                                <Link href={route('admin.permissions.edit', p.id)}>View</Link>
                            </Button>
                            {!isSystemPermission(p.name) && (
                                <>
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={route('admin.permissions.edit', p.id)}>Edit</Link>
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(p.id)}
                                        aria-label={`Delete permission ${p.name}`}
                                    >
                                        Delete
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )),
        [],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permissions Management" />

            <div className="p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Permissions Management</CardTitle>
                        <CardDescription>
                            Manage the permissions that can be assigned to roles. System permissions cannot be modified.
                        </CardDescription>
                        <div className="flex justify-end gap-2">
                            <Button asChild size="sm">
                                <Link href={route('admin.permissions.create')}>Create Permission</Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <CrudIndex
                            resource="permissions"
                            rows={permissions.data}
                            columns={permissionColumns}
                            renderMobile={renderMobile}
                            onDelete={handleDelete}
                            paginator={permissions}
                            searchable={true}
                            onSearch={handleSearch}
                            onSort={handleSort}
                            canDelete={(row: Permission) => !isSystemPermission(row.name)}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
