import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ChartOfAccount, PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { ChartOfAccountForm } from './components/form';

interface EditChartOfAccountProps extends PageProps {
    account: ChartOfAccount;
}

export default function EditChartOfAccount({ account }: EditChartOfAccountProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Masterfiles', href: '#' },
        { title: 'Chart of Accounts', href: route('masterfiles.chart-of-accounts.index') },
        { title: 'Edit', href: route('masterfiles.chart-of-accounts.edit', account.id) },
    ];

    const defaultValues = {
        account_code: account.account_code,
        account_name: account.account_name,
        account_type: account.account_type,
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
                            url={route('masterfiles.chart-of-accounts.update', account.id)}
                            method="put"
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
