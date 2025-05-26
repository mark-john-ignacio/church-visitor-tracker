import type { SortDirection } from '@/components/data-table';
import { CrudIndex } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, LaravelPaginator, PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';

interface Role {
    id: number;
    name: string;
    permissions: { id: number; name: string }[];
    created_at: string;
}

interface RolesPageProps extends PageProps {
    roles: LaravelPaginator<Role>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '#' },
    { title: 'Roles & Permissions', href: route('admin.roles.index') },
];

const roleColumns = [
    { label: 'Name', key: 'name', sortable: true },
    {
        label: 'Permissions',
        key: 'permissions',
        render: (r: Role) =>
            r.permissions.map((p) => (
                <Badge key={p.name} variant="secondary" className="mr-1">
                    {p.name}
                </Badge>
            )),
    },
    {
        label: 'Created',
        key: 'created_at',
        sortable: true,
        render: (r: Role) => new Date(r.created_at).toLocaleDateString(),
    },
];

export default function RolesIndex({ roles }: RolesPageProps) {
    const handleDelete = useCallback((id: number) => {
        router.delete(route('admin.roles.destroy', id), {});
    }, []);

    const handleSearch = useCallback((searchTerm: string) => {
        router.get(
            route('admin.roles.index'),
            { search: searchTerm },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, []);

    const handleSort = useCallback((column: string, direction: SortDirection) => {
        router.get(
            route('admin.roles.index'),
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
        () => (rows: Role[]) =>
            rows.map((r) => (
                <Card key={r.id} className="border">
                    <CardContent className="space-y-1">
                        <p>
                            <strong>Name:</strong> {r.name}
                        </p>
                        {r.permissions.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                <strong>Permissions: </strong>
                                <div className="flex flex-wrap gap-1">
                                    {r.permissions.map((p) => (
                                        <Badge key={p.name}>{p.name}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        <p className="text-muted-foreground text-xs">Created: {new Date(r.created_at).toLocaleDateString()}</p>
                        <div className="flex justify-end gap-2">
                            <Button asChild size="sm" variant="outline">
                                <Link href={route('admin.roles.edit', r.id)}>Edit</Link>
                            </Button>
                            {r.name !== 'super_admin' && (
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(r.id)} aria-label={`Delete role ${r.name}`}>
                                    Delete
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )),
        [],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles & Permissions Management" />

            <div className="p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Roles & Permissions Management</CardTitle>
                        <CardDescription>Manage roles and their associated permissions.</CardDescription>
                        <div className="flex justify-end gap-2">
                            <Button asChild size="sm">
                                <Link href={route('admin.roles.create')}>Create Role</Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <CrudIndex
                            resource="roles"
                            rows={roles.data}
                            columns={roleColumns}
                            renderMobile={renderMobile}
                            onDelete={handleDelete}
                            paginator={roles}
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
