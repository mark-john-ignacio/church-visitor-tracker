import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { PermissionForm } from './components/PermissionForm';

interface Permission {
    id: number;
    name: string;
    created_at: string;
}

interface EditPermissionProps extends PageProps {
    permission: Permission;
}

// System permissions that shouldn't be edited or deleted
const systemPermissions = ['view_dashboard', 'view_admin', 'manage_users', 'manage_roles', 'manage_permissions', 'manage_navigation'];

export default function EditPermission({ permission }: EditPermissionProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '#' },
        { title: 'Permissions', href: route('admin.permissions.index') },
        { title: 'Edit', href: route('admin.permissions.edit', permission.id) },
    ];

    const defaultValues = {
        name: permission.name,
    };

    const isSystemPerm = systemPermissions.includes(permission.name);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${isSystemPerm ? 'View' : 'Edit'} Permission: ${permission.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {isSystemPerm ? 'View' : 'Edit'} Permission: {permission.name}
                        </CardTitle>
                        <CardDescription>
                            {isSystemPerm ? 'View permission details. System permissions cannot be modified.' : 'Update permission details.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PermissionForm
                            defaultValues={defaultValues}
                            url={route('admin.permissions.update', permission.id)}
                            method="put"
                            isSystemPermission={isSystemPerm}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
