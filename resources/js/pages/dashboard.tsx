import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { AlertTriangle, Calendar, Mail, Phone, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DashboardStats {
    total_visitors: number;
    first_time_visitors: number;
    visitors_today: number;
    visitors_this_week: number;
    visitors_this_month: number;
    pending_follow_ups: number;
    total_follow_ups: number;
    completed_today: number;
    overdue_follow_ups: number;
    scheduled_this_week: number;
    recent_visitors: Array<{
        id: number;
        name: string;
        email?: string;
        visit_date: string;
        is_first_time: boolean;
        wants_followup: boolean;
    }>;
}

interface ChartData {
    visitorTrends: Array<{
        date: string;
        visitors: number;
        first_time: number;
    }>;
    followUpDistribution: Array<{
        status: string;
        label: string;
        count: number;
    }>;
    ageGroupDistribution: Array<{
        age_group: string;
        label: string;
        count: number;
    }>;
}

interface RecentActivity {
    id: number;
    visitor_name: string;
    status: string;
    method: string;
    followed_up_by: string;
    created_at: string;
    notes?: string;
}

interface OverdueFollowUp {
    id: number;
    visitor: {
        id: number;
        name: string;
        email?: string;
    };
    scheduled_at: string;
    days_overdue: number;
    followed_up_by: string;
}

interface DashboardProps {
    stats: DashboardStats;
    chartData: ChartData;
    recentActivities: RecentActivity[];
    overdueFollowUps: OverdueFollowUp[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ stats, chartData, recentActivities, overdueFollowUps }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome to your church visitor tracking dashboard</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                            <Users className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_visitors}</div>
                            <p className="text-muted-foreground text-xs">{stats.first_time_visitors} first-time visitors</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Month</CardTitle>
                            <Calendar className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.visitors_this_month}</div>
                            <p className="text-muted-foreground text-xs">{stats.visitors_this_week} this week</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Follow-ups</CardTitle>
                            <Phone className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending_follow_ups}</div>
                            <p className="text-muted-foreground text-xs">{stats.completed_today} completed today</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                            <AlertTriangle className="text-destructive h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-destructive text-2xl font-bold">{stats.overdue_follow_ups}</div>
                            <p className="text-muted-foreground text-xs">Follow-ups past due</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Visitor Trends (Last 30 Days)</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={chartData.visitorTrends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="visitors" stroke="#8884d8" strokeWidth={2} name="Total Visitors" />
                                    <Line type="monotone" dataKey="first_time" stroke="#82ca9d" strokeWidth={2} name="First-time Visitors" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Follow-up Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={chartData.followUpDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {chartData.followUpDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Age Groups</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData.ageGroupDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="label" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Recent Visitors</CardTitle>
                            <div className="flex gap-2">
                                <Button asChild size="sm">
                                    <Link href="/visitors">View All</Link>
                                </Button>
                                <Button asChild size="sm" variant="outline">
                                    <Link href="/visitors/create">Add New</Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats.recent_visitors.map((visitor) => (
                                    <div key={visitor.id} className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm leading-none font-medium">
                                                <Link href={`/visitors/${visitor.id}`} className="hover:underline">
                                                    {visitor.name}
                                                </Link>
                                            </p>
                                            <p className="text-muted-foreground text-xs">{visitor.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {visitor.is_first_time && <Badge variant="secondary">First Time</Badge>}
                                            {visitor.wants_followup && <Badge variant="outline">Follow-up</Badge>}
                                            <p className="text-muted-foreground text-xs">{format(new Date(visitor.visit_date), 'MMM d')}</p>
                                        </div>
                                    </div>
                                ))}
                                {stats.recent_visitors.length === 0 && <p className="text-muted-foreground text-sm">No recent visitors</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activities & Overdue Follow-ups */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Follow-up Activities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            {activity.method === 'phone' && <Phone className="h-4 w-4 text-blue-500" />}
                                            {activity.method === 'email' && <Mail className="h-4 w-4 text-green-500" />}
                                            {activity.method === 'text' && <Phone className="h-4 w-4 text-purple-500" />}
                                            {activity.method === 'in_person' && <Users className="h-4 w-4 text-orange-500" />}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium">
                                                {activity.followed_up_by} contacted {activity.visitor_name}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                {activity.method} • {activity.status} • {format(new Date(activity.created_at), 'MMM d, h:mm a')}
                                            </p>
                                            {activity.notes && (
                                                <p className="text-muted-foreground text-xs italic">"{activity.notes.substring(0, 60)}..."</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {recentActivities.length === 0 && <p className="text-muted-foreground text-sm">No recent activities</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="text-destructive h-4 w-4" />
                                Overdue Follow-ups
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {overdueFollowUps.map((followUp) => (
                                    <div key={followUp.id} className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">
                                                <Link href={`/visitors/${followUp.visitor.id}`} className="hover:underline">
                                                    {followUp.visitor.name}
                                                </Link>
                                            </p>
                                            <p className="text-muted-foreground text-xs">Assigned to: {followUp.followed_up_by}</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="destructive">
                                                {followUp.days_overdue} day{followUp.days_overdue !== 1 ? 's' : ''} overdue
                                            </Badge>
                                            <p className="text-muted-foreground mt-1 text-xs">
                                                Due: {format(new Date(followUp.scheduled_at), 'MMM d')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {overdueFollowUps.length === 0 && <p className="text-muted-foreground text-sm">No overdue follow-ups</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
