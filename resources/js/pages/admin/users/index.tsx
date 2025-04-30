import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps, User } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface LaravelPaginator<T> {
    current_page: number;
    data: T[];
    first_page_url: string | null;
    from: number | null;
    last_page: number;
    last_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

interface UsersPageProps extends PageProps {
    users: LaravelPaginator<User>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: route('admin.index') },
    { title: 'Users', href: route('admin.users.index') },
];

export default function UserManagementIndex({ auth, users }: UsersPageProps) {
    if (!users || !users.data) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="User Management" />
                <Card>
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>Manage application users and their roles.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Loading users or no users found...</p>
                    </CardContent>
                </Card>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
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
                    <CardContent>
                        {/* Desktop Table */}
                        <div className="hidden overflow-x-auto sm:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead className="hidden sm:table-cell">Roles</TableHead>
                                        <TableHead className="hidden md:table-cell">Joined</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.length > 0 ? (
                                        users.data.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    {user.roles?.map((role) => (
                                                        <Badge key={role.name} variant="secondary" className="mr-1">
                                                            {role.name}
                                                        </Badge>
                                                    ))}
                                                </TableCell>
                                                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button asChild variant="outline" size="sm" className="mr-2">
                                                        <Link href={route('admin.users.edit', user.id)}>Edit</Link>
                                                    </Button>
                                                    <Button variant="destructive" size="sm">
                                                        Delete
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
                                                No users found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile List */}
                        <div className="flex flex-col gap-4 sm:hidden">
                            {users.data.map((user) => (
                                <Card key={user.id} className="border">
                                    <CardContent className="space-y-1">
                                        <p>
                                            <span className="font-semibold">Name:</span> {user.name}
                                        </p>
                                        <p>
                                            <span className="font-semibold">Email:</span> {user.email}
                                        </p>
                                        {(user.roles?.length ?? 0) > 0 && (
                                            <p className="flex flex-wrap gap-1">
                                                {user.roles!.map((r) => (
                                                    <Badge key={r.name} variant="secondary">
                                                        {r.name}
                                                    </Badge>
                                                ))}
                                            </p>
                                        )}
                                        <p className="text-muted-foreground text-xs">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                                        <div className="flex justify-end gap-2">
                                            <Button asChild size="sm" variant="outline">
                                                <Link href={route('admin.users.edit', user.id)}>Edit</Link>
                                            </Button>
                                            <Button variant="destructive" size="sm">
                                                Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">
                                Showing {users.from ?? 0} to {users.to ?? 0} of {users.total} results
                            </span>
                            <div className="flex gap-1">
                                {users.links.map((link, index) =>
                                    link.url ? (
                                        <Button key={index} asChild size="sm" variant={link.active ? 'default' : 'outline'} disabled={!link.url}>
                                            <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} preserveScroll preserveState />
                                        </Button>
                                    ) : (
                                        <Button key={index} size="sm" variant="outline" disabled dangerouslySetInnerHTML={{ __html: link.label }} />
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
