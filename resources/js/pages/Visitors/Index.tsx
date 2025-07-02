import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Calendar, Download, Filter, Mail, Phone, Search, UserPlus } from 'lucide-react';
import { useState } from 'react';

interface Visitor {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    visit_date: string;
    service_type?: string;
    age_group?: string;
    is_first_time: boolean;
    wants_followup: boolean;
    wants_newsletter: boolean;
    tags?: string[];
    follow_ups?: FollowUp[];
}

interface FollowUp {
    id: number;
    status: string;
    method: string;
    created_at: string;
}

interface Filters {
    search?: string;
    service_type?: string;
    age_group?: string;
    is_first_time?: boolean;
    wants_followup?: boolean;
    date_from?: string;
    date_to?: string;
}

interface VisitorsIndexProps {
    visitors: {
        data: Visitor[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: Filters;
    serviceTypes: Record<string, string>;
    ageGroups: Record<string, string>;
}

const breadcrumbs = [
    {
        title: 'Visitors',
        href: '/visitors',
    },
];

export default function VisitorsIndex({ visitors, filters, serviceTypes, ageGroups }: VisitorsIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/visitors',
            { ...filters, search: searchTerm },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleFilterChange = (key: string, value: string | boolean) => {
        router.get(
            '/visitors',
            { ...filters, [key]: value },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const clearFilters = () => {
        router.get(
            '/visitors',
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
        setSearchTerm('');
    };

    const exportVisitors = () => {
        const queryString = new URLSearchParams(filters as Record<string, string>).toString();
        window.location.href = `/visitors/export?${queryString}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Visitors" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Visitors</h1>
                        <p className="text-muted-foreground">Manage and track your church visitors</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={exportVisitors} variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button asChild>
                            <Link href="/visitors/create">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add Visitor
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                                    <Input
                                        placeholder="Search visitors by name, email, or phone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button type="submit">Search</Button>
                                <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)}>
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filters
                                </Button>
                            </form>

                            {showFilters && (
                                <div className="grid gap-4 border-t pt-4 md:grid-cols-3 lg:grid-cols-6">
                                    <Select value={filters.service_type || ''} onValueChange={(value) => handleFilterChange('service_type', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Service Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Services</SelectItem>
                                            {Object.entries(serviceTypes).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={filters.age_group || ''} onValueChange={(value) => handleFilterChange('age_group', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Age Group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Ages</SelectItem>
                                            {Object.entries(ageGroups).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={filters.is_first_time?.toString() || ''}
                                        onValueChange={(value) => handleFilterChange('is_first_time', value === 'true')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="First Time" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Visitors</SelectItem>
                                            <SelectItem value="true">First Time Only</SelectItem>
                                            <SelectItem value="false">Returning Only</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={filters.wants_followup?.toString() || ''}
                                        onValueChange={(value) => handleFilterChange('wants_followup', value === 'true')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Follow-up" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All</SelectItem>
                                            <SelectItem value="true">Wants Follow-up</SelectItem>
                                            <SelectItem value="false">No Follow-up</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Input
                                        type="date"
                                        placeholder="From Date"
                                        value={filters.date_from || ''}
                                        onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                    />

                                    <Input
                                        type="date"
                                        placeholder="To Date"
                                        value={filters.date_to || ''}
                                        onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                    />

                                    <div className="col-span-full">
                                        <Button variant="outline" onClick={clearFilters}>
                                            Clear All Filters
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Results */}
                <div className="space-y-4">
                    <div className="text-muted-foreground text-sm">
                        Showing {visitors.data.length} of {visitors.total} visitors
                    </div>

                    <div className="grid gap-4">
                        {visitors.data.map((visitor) => (
                            <Card key={visitor.id} className="transition-shadow hover:shadow-md">
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-semibold">
                                                    <Link href={`/visitors/${visitor.id}`} className="hover:underline">
                                                        {visitor.name}
                                                    </Link>
                                                </h3>
                                                <div className="flex gap-2">
                                                    {visitor.is_first_time && <Badge variant="secondary">First Time</Badge>}
                                                    {visitor.wants_followup && <Badge variant="outline">Follow-up</Badge>}
                                                    {visitor.wants_newsletter && <Badge variant="outline">Newsletter</Badge>}
                                                </div>
                                            </div>

                                            <div className="text-muted-foreground flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {format(new Date(visitor.visit_date), 'MMM d, yyyy')}
                                                </div>
                                                {visitor.email && (
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="h-4 w-4" />
                                                        {visitor.email}
                                                    </div>
                                                )}
                                                {visitor.phone && (
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="h-4 w-4" />
                                                        {visitor.phone}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 text-sm">
                                                {visitor.service_type && (
                                                    <span className="text-muted-foreground">Service: {visitor.service_type}</span>
                                                )}
                                                {visitor.age_group && (
                                                    <span className="text-muted-foreground">Age: {ageGroups[visitor.age_group]}</span>
                                                )}
                                            </div>

                                            {visitor.tags && visitor.tags.length > 0 && (
                                                <div className="flex gap-1">
                                                    {visitor.tags.map((tag) => (
                                                        <Badge key={tag} variant="outline" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2 text-right">
                                            <div className="text-muted-foreground text-sm">
                                                {visitor.follow_ups && visitor.follow_ups.length > 0 ? (
                                                    <span>
                                                        Last: {visitor.follow_ups[0].status} ({visitor.follow_ups[0].method})
                                                    </span>
                                                ) : (
                                                    <span>No follow-ups</span>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={`/visitors/${visitor.id}/edit`}>Edit</Link>
                                                </Button>
                                                <Button asChild size="sm">
                                                    <Link href={`/followups/create?visitor_id=${visitor.id}`}>Follow Up</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {visitors.data.length === 0 && (
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <p className="text-muted-foreground">No visitors found matching your criteria.</p>
                                <Button asChild className="mt-4">
                                    <Link href="/visitors/create">Add Your First Visitor</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Pagination */}
                    {visitors.last_page > 1 && (
                        <div className="flex items-center justify-center space-x-2">
                            {Array.from({ length: visitors.last_page }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={page === visitors.current_page ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() =>
                                        router.get(
                                            '/visitors',
                                            { ...filters, page },
                                            {
                                                preserveState: true,
                                                replace: true,
                                            },
                                        )
                                    }
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
