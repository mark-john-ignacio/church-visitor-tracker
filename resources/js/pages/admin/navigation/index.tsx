import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type LaravelPaginator, type PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { navigationColumns, type MenuItem } from './components/columns';

interface NavigationPageProps extends PageProps {
    navItems: LaravelPaginator<MenuItem>;
    filters?: {
        search?: string;
        sort?: string;
        order?: string;
    };
}

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Admin', href: '#' },
    { title: 'Navigation', href: route('admin.navigation.index') },
];

export default function NavigationIndex({ navItems, filters }: NavigationPageProps) {
    // Custom delete confirmation message function
    const getDeleteConfirmationMessage = (menuItem: MenuItem) => {
        return `Are you sure you want to delete the navigation item "${menuItem.name}"? This action cannot be undone and may affect the navigation structure.`;
    };

    // Transform Laravel pagination to our table format
    const paginationInfo = {
        pageIndex: navItems.current_page - 1, // Convert to 0-based index
        pageSize: navItems.per_page,
        pageCount: navItems.last_page,
        total: navItems.total,
    };

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Navigation Management" />

            <div className="p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <CardTitle>Navigation Management</CardTitle>
                                <CardDescription>Manage navigation items shown in the sidebar, footer, and user menus.</CardDescription>
                            </div>
                            <Button asChild>
                                <Link href={route('admin.navigation.create')}>Create Navigation Item</Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <DataTable
                            columns={navigationColumns}
                            data={navItems.data}
                            searchColumn="name"
                            searchPlaceholder="Filter navigation items..."
                            tableKey="navigation"
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
