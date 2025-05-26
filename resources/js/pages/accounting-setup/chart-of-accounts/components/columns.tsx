'use client';

import { useDeleteConfirmation } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChartOfAccount } from '@/types';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

export const chartOfAccountsColumns: ColumnDef<ChartOfAccount>[] = [
    {
        accessorKey: 'account_code',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Code
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
    },
    {
        accessorKey: 'account_name',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
    },
    {
        accessorKey: 'account_type',
        header: 'Type',
    },
    {
        accessorKey: 'account_nature',
        header: 'Nature',
    },
    {
        accessorKey: 'level',
        header: 'Level',
        cell: ({ row }) => <div className="text-center">{row.getValue('level')}</div>,
    },
    {
        id: 'header_account',
        header: 'Header Account',
        cell: ({ row }) => {
            const account = row.original;
            if (!account.header_account) return 'N/A';
            return `${account.header_account.account_code} - ${account.header_account.account_name}`;
        },
    },
    {
        accessorKey: 'is_contra_account',
        header: 'Contra',
        cell: ({ row }) => {
            const isContra = row.getValue('is_contra_account') as boolean;
            return (
                <div className="text-center">
                    <Badge variant={isContra ? 'destructive' : 'outline'}>{isContra ? 'Yes' : 'No'}</Badge>
                </div>
            );
        },
    },
    {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => {
            const isActive = row.getValue('is_active') as boolean;
            return (
                <div className="text-center">
                    <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const account = row.original;
            const { confirmDelete } = useDeleteConfirmation();

            const handleDelete = () => {
                const deleteAction = () => {
                    router.delete(route('accounting-setup.chart-of-accounts.destroy', account.id), {
                        onSuccess: () => {
                            toast.success('Account deleted successfully');
                        },
                        onError: (errors) => {
                            const errorMessage = errors.default || 'Failed to delete account';
                            toast.error(errorMessage);
                        },
                    });
                };

                const customMessage = `Are you sure you want to delete the account "${account.account_code} - ${account.account_name}"? This action cannot be undone.`;

                confirmDelete(account, deleteAction, customMessage);
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
                            <Link href={route('accounting-setup.chart-of-accounts.edit', account.id)}>Edit Account</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                            Delete Account
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
