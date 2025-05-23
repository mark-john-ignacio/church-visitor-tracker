import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { ChartOfAccountForm } from './components/form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Masterfiles', href: '#' },
    { title: 'Accounting Setup', href: '#' },
    { title: 'Chart of Accounts', href: route('accounting-setup.chart-of-accounts.index') },
    { title: 'Create', href: route('accounting-setup.chart-of-accounts.create') },
];

export default function CreateChartOfAccount({}: PageProps) {
    const defaultValues = {
        account_code: '',
        account_name: '',
        account_type: '',
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
                        <ChartOfAccountForm defaultValues={defaultValues} url={route('accounting-setup.chart-of-accounts.store')} method="post" />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
