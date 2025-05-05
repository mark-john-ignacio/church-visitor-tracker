import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { RoleForm } from './components/RoleForm';

interface CreateRoleProps extends PageProps {
    permissions: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '#' },
    { title: 'Roles & Permissions', href: route('admin.roles.index') },
    { title: 'Create', href: route('admin.roles.create') },
];

export default function CreateRole({ permissions }: CreateRoleProps) {
    const defaultValues = { name: '', permissions: [] };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Role" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Role</CardTitle>
                        <CardDescription>Define a new role and assign permissions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RoleForm defaultValues={defaultValues} permissions={permissions} url={route('admin.roles.store')} method="post" />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
