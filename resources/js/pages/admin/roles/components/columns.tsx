'use client';

import { Badge } from '@/components/ui/badge';
import { createConditionalActionsColumn, createDateColumn, createSortableColumn } from '@/utils/data-table/column-builders';
import { ColumnDef } from '@tanstack/react-table';

export interface Role {
    id: number;
    name: string;
    permissions: { id: number; name: string }[];
    created_at: string;
    updated_at: string;
}

export const roleColumns: ColumnDef<Role>[] = [
    createSortableColumn({
        accessorKey: 'name',
        header: 'Name',
    }),
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
    createDateColumn('created_at', 'Created'),
    createConditionalActionsColumn({
        editRoute: (id) => route('admin.roles.edit', id),
        deleteRoute: (id) => route('admin.roles.destroy', id),
        getItemName: (role) => role.name,
        successMessage: 'Role deleted successfully',
        errorMessage: 'Failed to delete role',
        canDelete: (role) => role.name !== 'super_admin',
        getEditLabel: (role) => (role.name === 'super_admin' ? 'View Role' : 'Edit Role'),
        deleteLabel: 'Delete Role',
    }),
];
