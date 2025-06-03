import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps, User } from '@/types';
import { Head } from '@inertiajs/react';
import { useMemo } from 'react';
import { UserForm } from './components/UserForm';

interface EditUserProps extends PageProps {
    user: User;
    roles: Record<string, string>;
    isSuperAdmin: boolean;
    canEdit: boolean;
    superAdminExists: boolean;
}

export default function EditUser({ user, roles, isSuperAdmin, canEdit, superAdminExists }: EditUserProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '#' },
        { title: 'Users', href: route('admin.users.index') },
        { title: canEdit ? 'Edit' : 'View', href: route('admin.users.edit', user.id) },
    ];

    interface UserRole {
        name: string;
    }

    interface User {
        id: number;
        name: string;
        email: string;
        roles?: UserRole[];
    }

    interface UserFormDefaultValues {
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        roles: string[];
    }

    const defaultValues: UserFormDefaultValues = useMemo(
        () => ({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            roles: user.roles?.map((r: UserRole) => r.name) || [],
        }),
        [user.name, user.email, user.roles],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${canEdit ? 'Edit' : 'View'} User: ${user.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>
                                {canEdit ? 'Edit' : 'View'} User: {user.name}
                            </CardTitle>
                            {isSuperAdmin && <Badge variant="destructive">Super Admin</Badge>}
                        </div>
                        <CardDescription>
                            {isSuperAdmin && !canEdit
                                ? 'Super Admin users can only be edited by themselves.'
                                : 'Update user profile and role assignments.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UserForm
                            defaultValues={defaultValues}
                            roles={roles}
                            url={route('admin.users.update', user.id)}
                            method="put"
                            disabled={!canEdit}
                            superAdminExists={superAdminExists}
                            isSuperAdmin={isSuperAdmin}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
