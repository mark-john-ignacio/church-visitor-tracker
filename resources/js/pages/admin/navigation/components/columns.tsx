'use client';

import { useDeleteConfirmation } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

export interface MenuItem {
    id: number;
    name: string;
    route: string | null;
    icon: string | null;
    permission_name: string | null;
    parent_id: number | null;
    order: number;
    type: string;
    parent?: { id: number; name: string } | null;
    created_at: string;
    updated_at: string;
}

export const navigationColumns: ColumnDef<MenuItem>[] = [
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
        accessorKey: 'type',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Type
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const type = row.getValue('type') as string;
            const variant = type === 'main' ? 'default' : type === 'footer' ? 'outline' : 'secondary';
            return <Badge variant={variant}>{type}</Badge>;
        },
    },
    {
        accessorKey: 'route',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Route
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const route = row.getValue('route') as string;
            return route || <span className="text-muted-foreground">N/A</span>;
        },
    },
    {
        accessorKey: 'icon',
        header: 'Icon',
        cell: ({ row }) => {
            const icon = row.getValue('icon') as string;
            return icon ? <Badge variant="outline">{icon}</Badge> : <span className="text-muted-foreground">None</span>;
        },
    },
    {
        id: 'parent',
        header: 'Parent',
        cell: ({ row }) => {
            const menuItem = row.original;
            return menuItem.parent ? <Badge variant="secondary">{menuItem.parent.name}</Badge> : <span className="text-muted-foreground">None</span>;
        },
    },
    {
        accessorKey: 'order',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Order
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const order = row.getValue('order') as number;
            return <div className="text-center">{order}</div>;
        },
    },
    {
        accessorKey: 'permission_name',
        header: 'Permission',
        cell: ({ row }) => {
            const permission = row.getValue('permission_name') as string;
            return permission ? <Badge variant="secondary">{permission}</Badge> : <span className="text-muted-foreground">None</span>;
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
            const menuItem = row.original;
            const { confirmDelete } = useDeleteConfirmation();

            const handleDelete = () => {
                const deleteAction = () => {
                    router.delete(route('admin.navigation.destroy', menuItem.id), {
                        onSuccess: () => {
                            toast.success('Navigation item deleted successfully');
                        },
                        onError: (errors) => {
                            const errorMessage = errors.default || 'Failed to delete navigation item';
                            toast.error(errorMessage);
                        },
                    });
                };

                const customMessage = `Are you sure you want to delete the navigation item "${menuItem.name}"? This action cannot be undone.`;
                confirmDelete(menuItem, deleteAction, customMessage);
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
                            <Link href={route('admin.navigation.edit', menuItem.id)}>Edit Navigation Item</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                            Delete Navigation Item
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
