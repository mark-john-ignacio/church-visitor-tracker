import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { UserForm } from './components/UserForm';

const baseCrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '#' },
    { title: 'Users', href: route('admin.users.index') },
    { title: 'Edit', href: '#' }, // we'll override below
];

export default function EditUser({ user, roles }: { user: any; roles: Record<string, string> }) {
    const breadcrumbs = baseCrumbs.map((b) => (b.title === 'Edit' ? { ...b, href: route('admin.users.edit', { user: user.id }) } : b));

    const defaultValues = {
        name: user.name,
        email: user.email,
        password: undefined,
        password_confirmation: undefined,
        roles: user.roles.map((r: any) => r.name),
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit User" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit User</CardTitle>
                        <CardDescription>Update user details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UserForm defaultValues={defaultValues} roles={roles} url={route('admin.users.update', { user: user.id })} method="put" />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
