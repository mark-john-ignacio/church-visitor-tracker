import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ChartOfAccountCreatePageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { ChartOfAccountForm } from './components/form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Masterfiles', href: '#' },
    { title: 'Accounting Setup', href: '#' },
    { title: 'Chart of Accounts', href: route('accounting-setup.chart-of-accounts.index') },
    { title: 'Create', href: route('accounting-setup.chart-of-accounts.create') },
];

export default function CreateChartOfAccount({ headerAccounts, accountCategories, accountTypes }: ChartOfAccountCreatePageProps) {
    const { errors } = usePage().props;

    const defaultValues = {
        account_code: '',
        account_name: '',
        account_category: undefined, // Changed from account_type
        account_type: 'Detail' as const, // Changed from account_nature
        is_contra_account: false,
        level: 1,
        header_account_id: undefined,
        description: '',
        is_active: true,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Chart of Account" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Chart of Account</CardTitle>
                        <CardDescription>Add a new account to the chart of accounts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartOfAccountForm
                            defaultValues={defaultValues}
                            url={route('accounting-setup.chart-of-accounts.store')}
                            method="post"
                            headerAccounts={headerAccounts}
                            accountCategories={accountCategories as string[] | undefined}
                            accountTypes={accountTypes as string[] | undefined}
                            errors={errors}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
