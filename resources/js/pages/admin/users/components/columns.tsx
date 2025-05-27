'use client';

import { useDeleteConfirmation } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

export const userColumns: ColumnDef<User>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
    },
    {
        accessorKey: 'email',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Email
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
    },
    {
        id: 'roles',
        header: 'Roles',
        cell: ({ row }) => {
            const user = row.original;
            const roles = user.roles || [];

            if (roles.length === 0) {
                return <Badge variant="outline">No Roles</Badge>;
            }

            return (
                <div className="flex flex-wrap gap-1">
                    {roles.map((role) => (
                        <Badge key={role.name} variant={role.name === 'super_admin' ? 'destructive' : 'secondary'}>
                            {role.name}
                        </Badge>
                    ))}
                </div>
            );
        },
    },
    {
        accessorKey: 'email_verified_at',
        header: 'Verified',
        cell: ({ row }) => {
            const isVerified = !!row.getValue('email_verified_at');
            return (
                <div className="text-center">
                    <Badge variant={isVerified ? 'default' : 'destructive'}>{isVerified ? 'Verified' : 'Unverified'}</Badge>
                </div>
            );
        },
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Joined
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const date = new Date(row.getValue('created_at'));
            return date.toLocaleDateString();
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const user = row.original;
            const { confirmDelete } = useDeleteConfirmation();
            const { auth } = usePage().props;

            // Check if user is super admin
            const isSuperAdmin = (user.roles || []).some((role) => role.name === 'super_admin');
            const canDelete = !isSuperAdmin;
            const canEdit = !isSuperAdmin || user.id === auth.user.id;

            const handleDelete = () => {
                const deleteAction = () => {
                    router.delete(route('admin.users.destroy', user.id), {
                        onSuccess: () => {
                            toast.success('User deleted successfully');
                        },
                        onError: (errors) => {
                            const errorMessage = errors.default || 'Failed to delete user';
                            toast.error(errorMessage);
                        },
                    });
                };

                const customMessage = `Are you sure you want to delete the user "${user.name}"? This action cannot be undone.`;
                confirmDelete(user, deleteAction, customMessage);
            };

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={route('admin.users.edit', user.id)}>{canEdit ? 'Edit User' : 'View User'}</Link>
                        </DropdownMenuItem>
                        {canDelete && (
                            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                                Delete User
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
