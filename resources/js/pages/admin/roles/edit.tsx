import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { RoleForm } from './components/RoleForm';

interface Role {
    id: number;
    name: string;
    permissions: { id: number; name: string }[];
}

interface EditRoleProps extends PageProps {
    role: Role;
    permissions: Record<string, string>;
}

export default function EditRole({ role, permissions }: EditRoleProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '#' },
        { title: 'Roles & Permissions', href: route('admin.roles.index') },
        { title: `Edit: ${role.name}`, href: route('admin.roles.edit', role.id) },
    ];

    const defaultValues = {
        name: role.name,
        permissions: role.permissions.map((p) => p.name),
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Role: ${role.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Role: {role.name}</CardTitle>
                        <CardDescription>Update role details and permissions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RoleForm defaultValues={defaultValues} permissions={permissions} url={route('admin.roles.update', role.id)} method="put" />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
