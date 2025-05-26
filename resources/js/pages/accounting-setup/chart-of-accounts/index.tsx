import { CrudIndex, type Column, type SortDirection } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type ChartOfAccount, type LaravelPaginator, type PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';

interface ChartOfAccountsPageProps extends PageProps {
    accounts: LaravelPaginator<ChartOfAccount>;
}

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Masterfiles', href: '#' },
    { title: 'Accounting Setup', href: '#' },
    { title: 'Chart of Accounts', href: route('accounting-setup.chart-of-accounts.index') },
];

const COLUMNS: Column<ChartOfAccount>[] = [
    {
        label: 'Code',
        key: 'account_code',
        sortable: true,
    },
    {
        label: 'Name',
        key: 'account_name',
        sortable: true,
    },
    {
        label: 'Type',
        key: 'account_type',
        sortable: true,
    },
    {
        label: 'Nature',
        key: 'account_nature',
        sortable: true,
    },
    {
        label: 'Level',
        key: 'level',
        sortable: true,
        className: 'text-center',
    },
    {
        label: 'Header Account',
        key: 'header_account_id',
        sortable: false,
        render: (account: ChartOfAccount) => {
            if (!account.header_account) return 'N/A';
            return `${account.header_account.account_code} - ${account.header_account.account_name}`;
        },
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
];

export default function ChartOfAccountsIndex({ accounts }: ChartOfAccountsPageProps) {
    const handleDelete = useCallback((id: number) => {
        router.delete(route('accounting-setup.chart-of-accounts.destroy', id), {
            onSuccess: () => {
                toast.success('Account deleted successfully');
            },
            onError: (errors) => {
                const errorMessage = errors.default || 'Failed to delete account';
                toast.error(errorMessage);
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
        const params = direction ? { sort: column, order: direction } : {};

        router.get(route('accounting-setup.chart-of-accounts.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    const renderMobile = useMemo(
        () => (rows: ChartOfAccount[]) =>
            rows.map((account) => (
                <Card key={account.id} className="border">
                    <CardContent className="space-y-3 p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">
                                {account.account_code} - {account.account_name}
                            </h3>
                            <Badge variant={account.is_active ? 'default' : 'secondary'}>{account.is_active ? 'Active' : 'Inactive'}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Type:</span> {account.account_type}
                            </div>
                            <div>
                                <span className="font-medium">Nature:</span> {account.account_nature}
                            </div>
                            <div>
                                <span className="font-medium">Level:</span> {account.level}
                            </div>
                            <div>
                                <span className="font-medium">Contra:</span> {account.is_contra_account ? 'Yes' : 'No'}
                            </div>
                        </div>

                        {account.header_account && (
                            <div className="text-sm">
                                <span className="font-medium">Header Account:</span> {account.header_account.account_code} -{' '}
                                {account.header_account.account_name}
                            </div>
                        )}

                        {account.description && (
                            <div className="text-muted-foreground text-sm">
                                <span className="font-medium">Description:</span> {account.description}
                            </div>
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
        [handleDelete],
    );

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Chart of Accounts" />

            <div className="p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Chart of Accounts</CardTitle>
                                <CardDescription>Manage your company's chart of accounts. This data is company-specific.</CardDescription>
                            </div>
                            <Button asChild>
                                <Link href={route('accounting-setup.chart-of-accounts.create')}>Create Account</Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <CrudIndex
                            resource="chart-of-accounts"
                            routePrefix="accounting-setup"
                            rows={accounts.data}
                            columns={COLUMNS}
                            renderMobile={renderMobile}
                            onDelete={handleDelete}
                            paginator={accounts}
                            searchable
                            onSearch={handleSearch}
                            onSort={handleSort}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
