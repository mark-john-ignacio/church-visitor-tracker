import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { UserForm } from './components/UserForm';

interface CreateUserProps extends PageProps {
    roles: Record<string, string>;
    superAdminExists: boolean;
}

export default function CreateUser({ roles, superAdminExists }: CreateUserProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '#' },
        { title: 'Users', href: route('admin.users.index') },
        { title: 'Create', href: route('admin.users.create') },
    ];

    const defaultValues = {
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [],
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Create User</CardTitle>
                        <CardDescription>Add a new user to the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UserForm
                            defaultValues={defaultValues}
                            roles={roles}
                            url={route('admin.users.store')}
                            method="post"
                            superAdminExists={superAdminExists}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
