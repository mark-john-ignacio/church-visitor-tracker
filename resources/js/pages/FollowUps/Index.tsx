import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Calendar, CheckCircle, Edit, Eye, Filter, Mail, Phone, Plus, Search, User } from 'lucide-react';
import { useState } from 'react';

interface FollowUp {
    id: number;
    visitor: {
        id: number;
        name: string;
        email?: string;
        phone?: string;
    };
    status: string;
    method: string;
    note: string;
    followed_up_by: {
        name: string;
    };
    follow_up_date: string;
    created_at: string;
}

interface FollowUpsIndexProps {
    followUps: {
        data: FollowUp[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        method?: string;
        followed_up_by?: string;
        date_from?: string;
        date_to?: string;
    };
    statusOptions: { [key: string]: string };
    methodOptions: { [key: string]: string };
    users: Array<{
        id: number;
        name: string;
    }>;
    auth: {
        user: any;
    };
}

export default function FollowUpsIndex({ followUps, filters, statusOptions, methodOptions, users, auth }: FollowUpsIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [methodFilter, setMethodFilter] = useState(filters.method || '');
    const [userFilter, setUserFilter] = useState(filters.followed_up_by || '');
    const [dateFromFilter, setDateFromFilter] = useState(filters.date_from || '');
    const [dateToFilter, setDateToFilter] = useState(filters.date_to || '');

    const handleFilter = () => {
        router.get(
            route('followups.index'),
            {
                search: searchTerm,
                status: statusFilter,
                method: methodFilter,
                followed_up_by: userFilter,
                date_from: dateFromFilter,
                date_to: dateToFilter,
            },
            {
                preserveState: true,
            },
        );
    };

    const handleCreateFollowUp = () => {
        router.get(route('followups.create'));
    };

    const viewFollowUp = (id: number) => {
        router.get(route('followups.show', id));
    };

    const editFollowUp = (id: number) => {
        router.get(route('followups.edit', id));
    };

    const markComplete = (id: number) => {
        router.post(
            route('followups.complete', id),
            {},
            {
                preserveState: true,
            },
        );
    };

    const viewVisitor = (visitorId: number) => {
        router.get(route('visitors.show', visitorId));
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'completed':
                return 'default';
            case 'pending':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <AppLayout>
            <Head title="Follow Ups" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Follow-ups Management</h1>
                        <p className="text-muted-foreground">Track and manage visitor follow-ups</p>
                    </div>

                    <Button onClick={handleCreateFollowUp}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Follow-up
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
                            <div>
                                <Input placeholder="Search follow-ups..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Statuses</SelectItem>
                                    {Object.entries(statusOptions).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={methodFilter} onValueChange={setMethodFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Methods</SelectItem>
                                    {Object.entries(methodOptions).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={userFilter} onValueChange={setUserFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Followed by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Users</SelectItem>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input type="date" placeholder="From date" value={dateFromFilter} onChange={(e) => setDateFromFilter(e.target.value)} />

                            <Input type="date" placeholder="To date" value={dateToFilter} onChange={(e) => setDateToFilter(e.target.value)} />
                        </div>

                        <div className="mt-4 flex justify-end">
                            <Button onClick={handleFilter}>
                                <Search className="mr-2 h-4 w-4" />
                                Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Follow-ups List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Follow-ups ({followUps.total})</CardTitle>
                        <CardDescription>Manage and track visitor follow-ups</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {followUps.data.length > 0 ? (
                            <div className="space-y-4">
                                {followUps.data.map((followUp) => (
                                    <div key={followUp.id} className="rounded-lg border p-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-4">
                                                    <h3 className="font-semibold">{followUp.visitor.name}</h3>
                                                    <Badge variant={getStatusBadgeVariant(followUp.status)}>
                                                        {statusOptions[followUp.status] || followUp.status}
                                                    </Badge>
                                                    <Badge variant="outline">{methodOptions[followUp.method] || followUp.method}</Badge>
                                                </div>

                                                <div className="mb-2 grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2 lg:grid-cols-4">
                                                    {followUp.visitor.email && (
                                                        <div className="flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            {followUp.visitor.email}
                                                        </div>
                                                    )}
                                                    {followUp.visitor.phone && (
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {followUp.visitor.phone}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {followUp.followed_up_by.name}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(followUp.follow_up_date), 'MMM dd, yyyy')}
                                                    </div>
                                                </div>

                                                {followUp.note && (
                                                    <p className="mb-2 text-sm text-gray-700">
                                                        {followUp.note.length > 100 ? followUp.note.substring(0, 100) + '...' : followUp.note}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" onClick={() => viewVisitor(followUp.visitor.id)}>
                                                    <User className="mr-1 h-4 w-4" />
                                                    Visitor
                                                </Button>

                                                <Button variant="outline" size="sm" onClick={() => viewFollowUp(followUp.id)}>
                                                    <Eye className="mr-1 h-4 w-4" />
                                                    View
                                                </Button>

                                                <Button variant="outline" size="sm" onClick={() => editFollowUp(followUp.id)}>
                                                    <Edit className="mr-1 h-4 w-4" />
                                                    Edit
                                                </Button>

                                                {followUp.status !== 'completed' && (
                                                    <Button variant="outline" size="sm" onClick={() => markComplete(followUp.id)}>
                                                        <CheckCircle className="mr-1 h-4 w-4" />
                                                        Complete
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <p className="mb-4 text-gray-500">No follow-ups found</p>
                                <Button onClick={handleCreateFollowUp}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create First Follow-up
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {followUps.last_page > 1 && (
                    <div className="flex justify-center">
                        <div className="flex items-center space-x-2">
                            {Array.from({ length: followUps.last_page }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={page === followUps.current_page ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() =>
                                        router.get(route('followups.index'), {
                                            ...filters,
                                            page,
                                        })
                                    }
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
