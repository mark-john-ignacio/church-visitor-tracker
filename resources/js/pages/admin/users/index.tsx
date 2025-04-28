import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// Import AppLayout instead of AppSidebarLayout
import AppLayout from '@/layouts/app-layout';
// Import BreadcrumbItem type if not already implicitly available via PageProps
import { BreadcrumbItem, PageProps, User } from '@/types';
import { Head, Link } from '@inertiajs/react'; // Import Head

// Interface reflecting Laravel's default Paginator structure
interface LaravelPaginator<T> {
    current_page: number;
    data: T[];
    first_page_url: string | null;
    from: number | null;
    last_page: number;
    last_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

// Update UsersPageProps
interface UsersPageProps extends PageProps {
    users: LaravelPaginator<User>;
}

// Define breadcrumbs for this page
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: route('admin.index') }, // Optional: Link to admin index
    { title: 'Users', href: route('admin.users.index') }, // Current page
];

export default function UserManagementIndex({ auth, users }: UsersPageProps) {
    // Loading check remains the same
    if (!users || !users.data) {
        return (
            // Use AppLayout here too for consistency
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="User Management" /> {/* Add Head */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>Manage application users and their roles.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Loading users or no users found...</p>
                    </CardContent>
                </Card>
            </AppLayout>
        );
    }

    return (
        // Use AppLayout and pass breadcrumbs
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Add Head component for page title */}
            <Head title="User Management" />

            {/* Wrap content in a div similar to dashboard if needed for padding/layout */}
            {/* Adjust padding/gap as needed */}
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>Manage application users and their roles.</CardDescription>
                    </CardHeader>
                    <Button asChild size="sm" className="float-right -mt-8">
                        {/* Use route() helper */}
                        <Link href={route('admin.users.create')}>Create User</Link>
                    </Button>
                    <CardContent>
                        <Table>
                            {/* Table Header and Body remain the same */}
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.length > 0 ? (
                                    users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                {user.roles?.map((role) => (
                                                    <Badge key={role.name} variant="secondary" className="mr-1">
                                                        {role.name}
                                                    </Badge>
                                                ))}
                                            </TableCell>
                                            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" className="mr-2">
                                                    Edit
                                                </Button>
                                                <Button variant="destructive" size="sm">
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination remains the same */}
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">
                                Showing {users.from ?? 0} to {users.to ?? 0} of {users.total} results
                            </span>
                            <div className="flex gap-1">
                                {users.links.map((link, index) =>
                                    link.url ? (
                                        <Button key={index} asChild size="sm" variant={link.active ? 'default' : 'outline'} disabled={!link.url}>
                                            <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} preserveScroll preserveState />
                                        </Button>
                                    ) : (
                                        <Button key={index} size="sm" variant="outline" disabled dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ),
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
