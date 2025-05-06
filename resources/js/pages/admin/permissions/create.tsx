import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { PermissionForm } from './components/PermissionForm';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '#' },
    { title: 'Permissions', href: route('admin.permissions.index') },
    { title: 'Create', href: route('admin.permissions.create') },
];

export default function CreatePermission({}: PageProps) {
    const defaultValues = { name: '' };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Permission" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Permission</CardTitle>
                        <CardDescription>Create a new permission that can be assigned to roles.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PermissionForm defaultValues={defaultValues} url={route('admin.permissions.store')} method="post" />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
