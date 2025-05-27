import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ChartOfAccountEditPageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { ChartOfAccountForm } from './components/form';

interface EditChartOfAccountProps extends ChartOfAccountEditPageProps {}

export default function EditChartOfAccount({ account, headerAccounts, accountCategories, accountTypes }: EditChartOfAccountProps) {
    const { errors } = usePage().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Masterfiles', href: '#' },
        { title: 'Accounting Setup', href: '#' },
        { title: 'Chart of Accounts', href: route('accounting-setup.chart-of-accounts.index') },
        { title: 'Edit', href: route('accounting-setup.chart-of-accounts.edit', account.id) },
    ];

    const defaultValues = {
        account_code: account.account_code,
        account_name: account.account_name,
        account_category: account.account_category, // Changed from account_type
        account_type: account.account_type, // Changed from account_nature
        is_contra_account: account.is_contra_account,
        level: account.level,
        header_account_id: account.header_account_id,
        description: account.description,
        is_active: account.is_active,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Chart of Account: ${account.account_code}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Chart of Account: {account.account_code}</CardTitle>
                        <CardDescription>Update account details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartOfAccountForm
                            defaultValues={defaultValues}
                            url={route('accounting-setup.chart-of-accounts.update', account.id)}
                            method="put"
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
