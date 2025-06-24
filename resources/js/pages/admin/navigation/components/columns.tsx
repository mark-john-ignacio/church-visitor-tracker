'use client';

import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import {
    createSortableColumn,
    createBadgeColumn,
    createOptionalColumn,
    createCenteredColumn,
    createDateColumn,
    createActionsColumn,
} from '@/utils/data-table/column-builders';

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
    createSortableColumn({
        accessorKey: 'name',
        header: 'Name',
    }),
    createBadgeColumn({
        accessorKey: 'type',
        header: 'Type',
        sortable: true,
        variantMap: {
            'main': 'default',
            'footer': "outline"
        },
        defaultVariant:'secondary',
    }),
    createOptionalColumn('route', 'Route', true, 'N/A'),
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
    createCenteredColumn('order', 'Order'),
    {
        accessorKey: 'permission_name',
        header: 'Permission',
        cell: ({ row }) => {
            const permission = row.getValue('permission_name') as string;
            return permission ? <Badge variant="secondary">{permission}</Badge> : <span className="text-muted-foreground">None</span>;
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
    createDateColumn('created_at', 'Created'),
    createActionsColumn({
        editRoute: (id) => route('admin.navigation.edit', id),
        deleteRoute: (id) => route('admin.navigation.destroy', id),
        editLabel: 'Edit Navigation Item',
        deleteLabel: 'Delete Navigation Item',
        getItemName: (item) => item.name,
        successMessage: 'Navigation item deleted successfully',
        errorMessage: 'Failed to delete navigation item',
    })
];
