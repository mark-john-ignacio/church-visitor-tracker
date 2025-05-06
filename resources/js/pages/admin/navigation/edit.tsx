import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { NavigationForm } from './components/NavigationForm';

interface EditNavigationProps {
    navigationItem: {
        id: number;
        name: string;
        route: string | null;
        icon: string | null;
        permission_name: string | null;
        parent_id: number | null;
        order: number;
        type: string;
    };
    parentItems: Record<string, string>;
    permissions: Record<string, string>;
    iconList: Record<string, string>;
    types: Record<string, string>;
}

export default function EditNavigation({ navigationItem, parentItems, permissions, iconList, types }: EditNavigationProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '#' },
        { title: 'Navigation', href: route('admin.navigation.index') },
        { title: 'Edit', href: route('admin.navigation.edit', navigationItem.id) },
    ];

    const defaultValues = {
        name: navigationItem.name,
        route: navigationItem.route,
        icon: navigationItem.icon,
        permission_name: navigationItem.permission_name,
        parent_id: navigationItem.parent_id,
        order: navigationItem.order,
        type: navigationItem.type,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Navigation Item: ${navigationItem.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Navigation Item: {navigationItem.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <NavigationForm
                            defaultValues={defaultValues}
                            url={route('admin.navigation.update', navigationItem.id)}
                            method="put"
                            parentItems={parentItems}
                            permissions={permissions}
                            iconList={iconList}
                            types={types}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
