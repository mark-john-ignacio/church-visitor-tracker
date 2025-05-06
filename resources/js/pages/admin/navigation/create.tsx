import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { NavigationForm } from './components/NavigationForm';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '#' },
    { title: 'Navigation', href: route('admin.navigation.index') },
    { title: 'Create', href: route('admin.navigation.create') },
];

interface CreateNavigationProps {
    parentItems: Record<string, string>;
    permissions: Record<string, string>;
    iconList: Record<string, string>;
    types: Record<string, string>;
}

export default function CreateNavigation({ parentItems, permissions, iconList, types }: CreateNavigationProps) {
    const defaultValues = {
        name: '',
        route: null,
        icon: null,
        permission_name: null,
        parent_id: null,
        order: 0,
        type: 'main',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Navigation Item" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Navigation Item</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <NavigationForm
                            defaultValues={defaultValues}
                            url={route('admin.navigation.store')}
                            method="post"
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
