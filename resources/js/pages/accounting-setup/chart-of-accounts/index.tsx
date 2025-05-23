import type { Column, SortDirection } from '@/components/CRUD-index';
import { CrudIndex } from '@/components/CRUD-index';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ChartOfAccount, LaravelPaginator, PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';

interface ChartOfAccountsPageProps extends PageProps {
    accounts: LaravelPaginator<ChartOfAccount>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Masterfiles', href: '#' },
    { title: 'Accounting Setup', href: '#' },
    { title: 'Chart of Accounts', href: route('accounting-setup.chart-of-accounts.index') },
];

const accountColumns: Column<ChartOfAccount>[] = [
    { label: 'Code', key: 'account_code', sortable: true },
    { label: 'Name', key: 'account_name', sortable: true },
    { label: 'Type', key: 'account_type', sortable: true },
    { label: 'Nature', key: 'account_nature', sortable: true },
    { label: 'Level', key: 'level', sortable: true, className: 'text-center' },
    {
        label: 'Header Acc.',
        key: 'header_account_id',
        sortable: false, // Sorting by ID might not be intuitive, consider sorting by header_account.name if needed
        render: (account: ChartOfAccount) =>
            account.header_account ? `${account.header_account.account_code} - ${account.header_account.account_name}` : 'N/A',
    },
    {
        label: 'Contra',
        key: 'is_contra_account',
        sortable: true,
        className: 'text-center',
        render: (account: ChartOfAccount) => (
            <Badge variant={account.is_contra_account ? 'destructive' : 'outline'}>{account.is_contra_account ? 'Yes' : 'No'}</Badge>
        ),
    },
    {
        label: 'Status',
        key: 'is_active',
        sortable: true,
        className: 'text-center',
        render: (account: ChartOfAccount) => (
            <Badge variant={account.is_active ? 'default' : 'secondary'}>{account.is_active ? 'Active' : 'Inactive'}</Badge>
        ),
    },
    // { label: 'Description', key: 'description', render: (account: ChartOfAccount) => account.description || '-' }, // Optional
    // { label: 'Created', key: 'created_at', sortable: true, render: (account: ChartOfAccount) => new Date(account.created_at).toLocaleDateString() }, // Optional
];

export default function ChartOfAccountsIndex({ accounts }: ChartOfAccountsPageProps) {
    const handleDelete = useCallback((id: number) => {
        router.delete(route('accounting-setup.chart-of-accounts.destroy', id), {
            onSuccess: () => {
                toast.success('Account deleted successfully');
            },
            onError: (errors) => {
                if (errors.default) {
                    toast.error(errors.default);
                } else {
                    toast.error('Failed to delete account');
                }
            },
        });
    }, []);

    const handleSearch = useCallback((searchTerm: string) => {
        router.get(
            route('accounting-setup.chart-of-accounts.index'),
            { search: searchTerm },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, []);

    const handleSort = useCallback((column: string, direction: SortDirection) => {
        router.get(
            route('accounting-setup.chart-of-accounts.index'),
            {
                sort: column,
                order: direction,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, []);

    const renderMobile = useMemo(
        () => (rows: ChartOfAccount[]) =>
            rows.map((account) => (
                <Card key={account.id} className="mb-4 border">
                    <CardContent className="space-y-2 p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-lg font-medium">
                                {account.account_code} - {account.account_name}
                            </p>
                            <Badge variant={account.is_active ? 'default' : 'secondary'}>{account.is_active ? 'Active' : 'Inactive'}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <p>
                                <strong>Type:</strong> {account.account_type}
                            </p>
                            <p>
                                <strong>Nature:</strong> {account.account_nature}
                            </p>
                            <p>
                                <strong>Level:</strong> {account.level}
                            </p>
                            <p>
                                <strong>Contra:</strong> {account.is_contra_account ? 'Yes' : 'No'}
                            </p>
                            {account.level > 1 && account.header_account && (
                                <p className="col-span-2">
                                    <strong>Header:</strong> {account.header_account.account_code} - {account.header_account.account_name}
                                </p>
                            )}
                        </div>
                        {account.description && (
                            <p className="text-muted-foreground text-sm">
                                <strong>Desc:</strong> {account.description}
                            </p>
                        )}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button asChild size="sm" variant="outline">
                                <Link href={route('accounting-setup.chart-of-accounts.edit', account.id)}>Edit</Link>
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(account.id)}
                                aria-label={`Delete account ${account.account_name}`}
                            >
                                Delete
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )),
        [],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Chart of Accounts" />

            <div className="p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Chart of Accounts</CardTitle>
                        <CardDescription>Manage your company's chart of accounts. This data is company-specific.</CardDescription>
                        <div className="flex justify-end gap-2">
                            <Button asChild size="sm">
                                <Link href={route('accounting-setup.chart-of-accounts.create')}>Create Account</Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <CrudIndex
                            resource="chart-of-accounts"
                            routePrefix="accounting-setup"
                            rows={accounts.data}
                            columns={accountColumns}
                            renderMobile={renderMobile}
                            onDelete={handleDelete}
                            paginator={accounts}
                            searchable={true}
                            onSearch={handleSearch}
                            onSort={handleSort}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
