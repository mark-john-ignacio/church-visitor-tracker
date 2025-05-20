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
    { title: 'Chart of Accounts', href: route('masterfiles.chart-of-accounts.index') },
];

// Extract columns for better type inference and readability
const accountColumns: Column<ChartOfAccount>[] = [
    { label: 'Code', key: 'account_code', sortable: true },
    { label: 'Name', key: 'account_name', sortable: true },
    { label: 'Type', key: 'account_type', sortable: true },
    {
        label: 'Description',
        key: 'description',
        render: (account: ChartOfAccount) => account.description || '-',
    },
    {
        label: 'Status',
        key: 'is_active',
        sortable: true,
        render: (account: ChartOfAccount) => (
            <Badge variant={account.is_active ? 'default' : 'secondary'}>{account.is_active ? 'Active' : 'Inactive'}</Badge>
        ),
    },
    {
        label: 'Created',
        key: 'created_at',
        sortable: true,
        render: (account: ChartOfAccount) => new Date(account.created_at).toLocaleDateString(),
    },
];

export default function ChartOfAccountsIndex({ accounts }: ChartOfAccountsPageProps) {
    const handleDelete = useCallback((id: number) => {
        router.delete(route('masterfiles.chart-of-accounts.destroy', id), {
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
            route('masterfiles.chart-of-accounts.index'),
            { search: searchTerm },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, []);

    const handleSort = useCallback((column: string, direction: SortDirection) => {
        router.get(
            route('masterfiles.chart-of-accounts.index'),
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
                <Card key={account.id} className="border">
                    <CardContent className="space-y-1 p-4">
                        <div className="flex items-center justify-between">
                            <p className="font-medium">{account.account_code}</p>
                            <Badge variant={account.is_active ? 'default' : 'secondary'}>{account.is_active ? 'Active' : 'Inactive'}</Badge>
                        </div>
                        <p>
                            <strong>Name:</strong> {account.account_name}
                        </p>
                        <p>
                            <strong>Type:</strong> {account.account_type}
                        </p>
                        {account.description && (
                            <p>
                                <strong>Description:</strong> {account.description}
                            </p>
                        )}
                        <p className="text-muted-foreground text-xs">Created: {new Date(account.created_at).toLocaleDateString()}</p>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button asChild size="sm" variant="outline">
                                <Link href={route('masterfiles.chart-of-accounts.edit', account.id)}>Edit</Link>
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
                                <Link href={route('masterfiles.chart-of-accounts.create')}>Create Account</Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <CrudIndex
                            resource="chart-of-accounts"
                            routePrefix="masterfiles"
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
