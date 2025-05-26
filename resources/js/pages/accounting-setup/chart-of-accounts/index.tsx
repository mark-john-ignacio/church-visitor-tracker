import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type ChartOfAccount, type LaravelPaginator, type PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { chartOfAccountsColumns } from './components/columns';

interface ChartOfAccountsPageProps extends PageProps {
    accounts: LaravelPaginator<ChartOfAccount>;
    filters?: {
        search?: string;
        sort?: string;
        order?: string;
    };
}

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Masterfiles', href: '#' },
    { title: 'Accounting Setup', href: '#' },
    { title: 'Chart of Accounts', href: route('accounting-setup.chart-of-accounts.index') },
];

export default function ChartOfAccountsIndex({ accounts, filters }: ChartOfAccountsPageProps) {
    // Custom delete confirmation message function
    const getDeleteConfirmationMessage = (account: ChartOfAccount) => {
        return `Are you sure you want to delete the account "${account.account_code} - ${account.account_name}"? This action cannot be undone and may affect related transactions.`;
    };

    // Transform Laravel pagination to our table format
    const paginationInfo = {
        pageIndex: accounts.current_page - 1, // Convert to 0-based index
        pageSize: accounts.per_page,
        pageCount: accounts.last_page,
        total: accounts.total,
    };

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Chart of Accounts" />

            <div className="p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
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
                        <DataTable
                            columns={chartOfAccountsColumns}
                            data={accounts.data}
                            searchColumn="account_name"
                            searchPlaceholder="Filter accounts..."
                            tableKey="chart-of-accounts"
                            getDeleteConfirmationMessage={getDeleteConfirmationMessage}
                            serverSide={true}
                            pagination={paginationInfo}
                            filters={filters} // Pass filters to sync with server state
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
