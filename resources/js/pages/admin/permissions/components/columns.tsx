'use client';

import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import {
    createSortableColumn,
    createBadgeColumn,
    createDateColumn,
    createConditionalActionsColumn,
} from '@/utils/data-table/column-builders';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';

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
    createBadgeColumn({
        accessorKey: 'guard_name',
        header: 'Guard',
        defaultVariant: 'secondary',
        fallbackValue: 'web',
    }),
    createDateColumn('created_at', 'Created'),
    createConditionalActionsColumn({
        editRoute: (id) => route('admin.permissions.destroy', id),
        deleteRoute: (id) => route('admin.permissions.destroy', id),
        getItemName: (permission) => permission.name,
        successMessage: 'Permission deleted successfully',
        errorMessage: 'Failed to delete permission',
        canEdit: (permission) => !isSystemPermission(permission.name),
        canDelete: (permission) => !isSystemPermission(permission.name),
        getEditLabel: (permission) => !isSystemPermission(permission.name) ? 'Edit Permission' : 'View Permission',
        deleteLabel: 'Delete Permission',
    }),
];