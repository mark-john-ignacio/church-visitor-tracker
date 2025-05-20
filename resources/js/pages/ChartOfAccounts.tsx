import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head } from '@inertiajs/react';

interface Account {
    id: number;
    account_code: string;
    account_name: string;
    account_type: string;
    description: string | null;
    is_active: boolean;
}

interface Props {
    accounts: Account[];
}

export default function ChartOfAccounts({ accounts }: Props) {
    const breadcrumbs = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Chart of Accounts', href: route('chart-of-accounts.index') },
    ];

    return (
        <>
            <Head title="Chart of Accounts" />

            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <div className="container mx-auto py-6">
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Chart of Accounts</CardTitle>
                            <CardDescription>Manage your company's chart of accounts. This data is company-specific.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {accounts.length === 0 ? (
                                <div className="text-muted-foreground py-8 text-center">No accounts found for this company.</div>
                            ) : (
                                <Table>
                                    <TableCaption>A list of accounts for your company.</TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Code</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {accounts.map((account) => (
                                            <TableRow key={account.id}>
                                                <TableCell className="font-medium">{account.account_code}</TableCell>
                                                <TableCell>{account.account_name}</TableCell>
                                                <TableCell>{account.account_type}</TableCell>
                                                <TableCell>{account.description || '-'}</TableCell>
                                                <TableCell>
                                                    {account.is_active ? (
                                                        <Badge variant="success">Active</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Inactive</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </AppSidebarLayout>
        </>
    );
}
