import type { SortDirection } from '@/components/CRUD-index';
import { CrudIndex } from '@/components/CRUD-index';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, LaravelPaginator, PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';

interface MenuItem {
    id: number;
    name: string;
    route: string;
    icon: string | null;
    permission_name: string | null;
    parent_id: number | null;
    order: number;
    type: string;
    parent?: { name: string } | null;
    created_at: string;
    updated_at: string;
}

interface NavigationPageProps extends PageProps {
    navItems: LaravelPaginator<MenuItem>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '#' },
    { title: 'Navigation', href: route('admin.navigation.index') },
];

const navigationColumns = [
    { label: 'Name', key: 'name', sortable: true },
    {
        label: 'Type',
        key: 'type',
        sortable: true,
        render: (item: MenuItem) => (
            <Badge variant={item.type === 'main' ? 'default' : item.type === 'footer' ? 'outline' : 'secondary'}>{item.type}</Badge>
        ),
    },
    {
        label: 'Path/Route',
        key: 'route',
        sortable: true,
        render: (item: MenuItem) => item.route || 'N/A',
    },
    {
        label: 'Icon',
        key: 'icon',
        render: (item: MenuItem) => item.icon || 'N/A',
    },
    {
        label: 'Parent',
        key: 'parent_id',
        render: (item: MenuItem) => (item.parent ? item.parent.name : 'None'),
    },
    {
        label: 'Order',
        key: 'order',
        sortable: true,
    },
    {
        label: 'Permission',
        key: 'permission_name',
        render: (item: MenuItem) => (item.permission_name ? <Badge variant="secondary">{item.permission_name}</Badge> : 'None'),
    },
];

export default function NavigationIndex({ navItems }: NavigationPageProps) {
    const handleDelete = useCallback((id: number) => {
        router.delete(route('admin.navigation.destroy', id), {
            onError: (errors) => {
                if (errors.default) {
                    toast.error(errors.default);
                }
            },
        });
    }, []);

    const handleSearch = useCallback((searchTerm: string) => {
        router.get(
            route('admin.navigation.index'),
            { search: searchTerm },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, []);

    const handleSort = useCallback((column: string, direction: SortDirection) => {
        router.get(
            route('admin.navigation.index'),
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
        () => (items: MenuItem[]) =>
            items.map((item) => (
                <Card key={item.id} className="border">
                    <CardContent className="space-y-1 p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium">{item.name}</h3>
                            <Badge variant={item.type === 'main' ? 'default' : item.type === 'footer' ? 'outline' : 'secondary'}>{item.type}</Badge>
                        </div>
                        <p>
                            <strong>Route:</strong> {item.route || 'N/A'}
                        </p>
                        {item.icon && (
                            <p>
                                <strong>Icon:</strong> {item.icon}
                            </p>
                        )}
                        {item.parent && (
                            <p>
                                <strong>Parent:</strong> {item.parent.name}
                            </p>
                        )}
                        <p>
                            <strong>Order:</strong> {item.order}
                        </p>
                        {item.permission_name && (
                            <p>
                                <strong>Permission:</strong> {item.permission_name}
                            </p>
                        )}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button asChild size="sm" variant="outline">
                                <Link href={route('admin.navigation.edit', item.id)}>Edit</Link>
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                                aria-label={`Delete navigation item ${item.name}`}
                            >
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
            <Head title="Navigation Management" />

            <div className="p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Navigation Management</CardTitle>
                        <CardDescription>Manage navigation items shown in the sidebar, footer, and user menus.</CardDescription>
                        <div className="flex justify-end gap-2">
                            <Button asChild size="sm">
                                <Link href={route('admin.navigation.create')}>Create Navigation Item</Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <CrudIndex
                            resource="navigation"
                            rows={navItems.data}
                            columns={navigationColumns}
                            renderMobile={renderMobile}
                            onDelete={handleDelete}
                            paginator={navItems}
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
