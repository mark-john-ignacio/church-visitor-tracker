'use client';

import { useDeleteConfirmation } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

export interface Permission {
    id: number;
    name: string;
    guard_name?: string;
    created_at: string;
    updated_at: string;
}

// System permissions that shouldn't be edited or deleted
const SYSTEM_PERMISSIONS = [
    'view_dashboard',
    'view_admin',
    'manage_users',
    'manage_roles',
    'manage_permissions',
    'manage_navigation',
    'view_masterfiles',
    'view_accounting_setup',
    'manage_chart_of_accounts',
    'manage_banks',
];

const isSystemPermission = (name: string): boolean => SYSTEM_PERMISSIONS.includes(name);

export const permissionColumns: ColumnDef<Permission>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const permission = row.original;
            const isSystem = isSystemPermission(permission.name);

            return (
                <div className="flex items-center gap-2">
                    <span>{permission.name}</span>
                    {isSystem && (
                        <Badge variant="outline" className="text-xs">
                            System
                        </Badge>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'guard_name',
        header: 'Guard',
        cell: ({ row }) => {
            const guardName = row.getValue('guard_name') as string;
            return <Badge variant="secondary">{guardName || 'web'}</Badge>;
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
            const permission = row.original;
            const { confirmDelete } = useDeleteConfirmation();
            const isSystem = isSystemPermission(permission.name);

            // System permissions can only be viewed, not edited or deleted
            const canEdit = !isSystem;
            const canDelete = !isSystem;

            const handleDelete = () => {
                const deleteAction = () => {
                    router.delete(route('admin.permissions.destroy', permission.id), {
                        onSuccess: () => {
                            toast.success('Permission deleted successfully');
                        },
                        onError: (errors) => {
                            const errorMessage = errors.default || 'Failed to delete permission';
                            toast.error(errorMessage);
                        },
                    });
                };

                const customMessage = `Are you sure you want to delete the permission "${permission.name}"? This action cannot be undone and will affect all roles that have this permission.`;
                confirmDelete(permission, deleteAction, customMessage);
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
                            <Link href={route('admin.permissions.edit', permission.id)}>{canEdit ? 'Edit Permission' : 'View Permission'}</Link>
                        </DropdownMenuItem>
                        {canDelete && (
                            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                                Delete Permission
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
