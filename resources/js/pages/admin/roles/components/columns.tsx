'use client';

import { useDeleteConfirmation } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

export interface Role {
    id: number;
    name: string;
    permissions: { id: number; name: string }[];
    created_at: string;
    updated_at: string;
}

export const roleColumns: ColumnDef<Role>[] = [
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
        id: 'permissions',
        header: 'Permissions',
        cell: ({ row }) => {
            const role = row.original;
            const permissions = role.permissions || [];

            if (permissions.length === 0) {
                return <Badge variant="outline">No Permissions</Badge>;
            }

            return (
                <div className="flex flex-wrap gap-1">
                    {permissions.slice(0, 3).map((permission) => (
                        <Badge key={permission.name} variant="secondary">
                            {permission.name}
                        </Badge>
                    ))}
                    {permissions.length > 3 && <Badge variant="outline">+{permissions.length - 3} more</Badge>}
                </div>
            );
        },
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Created
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
            const role = row.original;
            const { confirmDelete } = useDeleteConfirmation();

            // Prevent deletion of super_admin role
            const canDelete = role.name !== 'super_admin';
            const canEdit = true; // All roles can be edited, but super_admin has restrictions

            const handleDelete = () => {
                const deleteAction = () => {
                    router.delete(route('admin.roles.destroy', role.id), {
                        onSuccess: () => {
                            toast.success('Role deleted successfully');
                        },
                        onError: (errors) => {
                            const errorMessage = errors.default || 'Failed to delete role';
                            toast.error(errorMessage);
                        },
                    });
                };

                const customMessage = `Are you sure you want to delete the role "${role.name}"? This will remove the role from all users who have it assigned.`;
                confirmDelete(role, deleteAction, customMessage);
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
                            <Link href={route('admin.roles.edit', role.id)}>{role.name === 'super_admin' ? 'View Role' : 'Edit Role'}</Link>
                        </DropdownMenuItem>
                        {canDelete && (
                            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                                Delete Role
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
