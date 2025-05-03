import { CrudIndex } from '@/components/CRUD-index';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import useFlashToast from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, LaravelPaginator, PageProps, User } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface UsersPageProps extends PageProps {
    users: LaravelPaginator<User>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '#' },
    { title: 'Users', href: route('admin.users.index') },
];

export default function UserManagementIndex({ auth, users }: UsersPageProps) {
    useFlashToast();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>Manage application users and their roles.</CardDescription>
                        <div className="flex justify-end gap-2">
                            <Button asChild size="sm">
                                <Link href={route('admin.users.create')}>Create User</Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <CrudIndex
                            resource="users"
                            rows={users.data}
                            columns={[
                                { label: 'Name', key: 'name' },
                                { label: 'Email', key: 'email' },
                                {
                                    label: 'Roles',
                                    key: 'roles',
                                    render: (u: User) =>
                                        u.roles.map((r) => (
                                            <Badge key={r.name} variant="secondary" className="mr-1">
                                                {r.name}
                                            </Badge>
                                        )),
                                },
                                {
                                    label: 'Joined',
                                    key: 'created_at',
                                    render: (u: User) => new Date(u.created_at).toLocaleDateString(),
                                },
                            ]}
                            renderMobile={(rows) =>
                                rows.map((u) => (
                                    <Card key={u.id} className="border">
                                        <CardContent className="space-y-1">
                                            <p>
                                                <strong>Name:</strong> {u.name}
                                            </p>
                                            <p>
                                                <strong>Email:</strong> {u.email}
                                            </p>
                                            {u.roles.length > 0 && (
                                                <p className="flex flex-wrap gap-1">
                                                    {u.roles.map((r) => (
                                                        <Badge key={r.name}>{r.name}</Badge>
                                                    ))}
                                                </p>
                                            )}
                                            <p className="text-muted-foreground text-xs">Joined: {new Date(u.created_at).toLocaleDateString()}</p>
                                            <div className="flex justify-end gap-2">
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={route('admin.users.edit', u.id)}>Edit</Link>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        /* noop: handled by CrudIndex */
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            }
                        />

                        {/* Pagination */}
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">
                                Showing {users.from ?? 0}–{users.to ?? 0} of {users.total}
                            </span>
                            <div className="flex gap-1">
                                {users.links.map((l, i) =>
                                    l.url ? (
                                        <Button key={i} asChild size="sm" variant={l.active ? 'default' : 'outline'}>
                                            <Link href={l.url} preserveScroll preserveState dangerouslySetInnerHTML={{ __html: l.label }} />
                                        </Button>
                                    ) : (
                                        <Button key={i} size="sm" variant="outline" disabled dangerouslySetInnerHTML={{ __html: l.label }} />
                                    ),
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
