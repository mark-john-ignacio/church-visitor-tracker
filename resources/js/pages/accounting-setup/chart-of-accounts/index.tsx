import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type ChartOfAccount, type LaravelPaginator, type PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { chartOfAccountsColumns } from './components/columns';

interface ChartOfAccountsPageProps extends PageProps {
    accounts: LaravelPaginator<ChartOfAccount>;
}

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Masterfiles', href: '#' },
    { title: 'Accounting Setup', href: '#' },
    { title: 'Chart of Accounts', href: route('accounting-setup.chart-of-accounts.index') },
];

export default function ChartOfAccountsIndex({ accounts }: ChartOfAccountsPageProps) {
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
                            tableKey="chart-of-accounts" // Unique key for this table
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
