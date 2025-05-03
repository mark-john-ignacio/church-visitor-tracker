import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, LaravelPaginator, PageProps, User } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UsersPageProps extends PageProps {
    users: LaravelPaginator<User>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '#' },
    { title: 'Users', href: route('admin.users.index') },
];

export default function UserManagementIndex({ auth, users }: UsersPageProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const { success, error } = flash ?? {};

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toDelete, setToDelete] = useState<User | null>(null);

    useEffect(() => {
        if (success) toast.success(success);
        if (error) toast.error(error);
    }, [success, error]);

    const handleDelete = useCallback((id: number) => {
        router.delete(route('admin.users.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success('User deleted'),
            onError: () => toast.error('Delete failed'),
        });
    }, []);

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
                        {/* Desktop */}
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
                                    {users.data.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
                                                No users found.
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                {user.roles?.map((r) => (
                                                    <Badge key={r.name} variant="secondary" className="mr-1">
                                                        {r.name}
                                                    </Badge>
                                                ))}
                                            </TableCell>
                                            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild variant="outline" size="sm" className="mr-2">
                                                    <Link href={route('admin.users.edit', user.id)}>Edit</Link>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        setToDelete(user);
                                                        setConfirmOpen(true);
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile */}
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
                                        {user.roles?.length > 0 && (
                                            <p className="flex flex-wrap gap-1">
                                                {user.roles.map((r) => (
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
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => {
                                                    setToDelete(user);
                                                    setConfirmOpen(true);
                                                }}
                                            >
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

            {/* Confirmation Dialog */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{toDelete?.name}</strong>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (toDelete) handleDelete(toDelete.id);
                                setConfirmOpen(false);
                            }}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
