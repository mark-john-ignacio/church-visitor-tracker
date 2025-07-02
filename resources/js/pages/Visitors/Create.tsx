import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface CreateVisitorProps {
    serviceTypes: Record<string, string>;
    ageGroups: Record<string, string>;
    hearAboutOptions: Record<string, string>;
}

const breadcrumbs = [
    {
        title: 'Visitors',
        href: '/visitors',
    },
    {
        title: 'Create',
        href: '/visitors/create',
    },
];

export default function CreateVisitor({ serviceTypes, ageGroups, hearAboutOptions }: CreateVisitorProps) {
    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        email: string;
        phone: string;
        address: string;
        visit_date: string;
        invited_by: string;
        tags: string;
        notes: string;
        service_type: string;
        is_first_time: boolean;
        age_group: string;
        how_did_you_hear: string;
        wants_followup: boolean;
        wants_newsletter: boolean;
    }>({
        name: '',
        email: '',
        phone: '',
        address: '',
        visit_date: new Date().toISOString().split('T')[0],
        invited_by: '',
        tags: '',
        notes: '',
        service_type: '',
        is_first_time: true,
        age_group: '',
        how_did_you_hear: '',
        wants_followup: true,
        wants_newsletter: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('visitors.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Visitor" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Add New Visitor</h1>
                    <p className="text-muted-foreground">Record information about a new church visitor</p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter visitor's full name"
                                    />
                                    {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter email address"
                                    />
                                    {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="Enter phone number"
                                    />
                                    {errors.phone && <p className="text-destructive text-sm">{errors.phone}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Enter full address"
                                        rows={3}
                                    />
                                    {errors.address && <p className="text-destructive text-sm">{errors.address}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Visit Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="visit_date">Visit Date *</Label>
                                    <Input
                                        id="visit_date"
                                        type="date"
                                        value={data.visit_date}
                                        onChange={(e) => setData('visit_date', e.target.value)}
                                    />
                                    {errors.visit_date && <p className="text-destructive text-sm">{errors.visit_date}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="service_type">Service Type</Label>
                                    <Select value={data.service_type} onValueChange={(value) => setData('service_type', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select service type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(serviceTypes).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.service_type && <p className="text-destructive text-sm">{errors.service_type}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="age_group">Age Group</Label>
                                    <Select value={data.age_group} onValueChange={(value) => setData('age_group', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select age group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(ageGroups).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.age_group && <p className="text-destructive text-sm">{errors.age_group}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="invited_by">Invited By</Label>
                                    <Input
                                        id="invited_by"
                                        value={data.invited_by}
                                        onChange={(e) => setData('invited_by', e.target.value)}
                                        placeholder="Who invited this person?"
                                    />
                                    {errors.invited_by && <p className="text-destructive text-sm">{errors.invited_by}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="how_did_you_hear">How Did You Hear About Us?</Label>
                                    <Select value={data.how_did_you_hear} onValueChange={(value) => setData('how_did_you_hear', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select how they heard about us" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(hearAboutOptions).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.how_did_you_hear && <p className="text-destructive text-sm">{errors.how_did_you_hear}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags</Label>
                                <Input
                                    id="tags"
                                    value={data.tags}
                                    onChange={(e) => setData('tags', e.target.value)}
                                    placeholder="Enter tags separated by commas (e.g., new, interested, youth)"
                                />
                                <p className="text-muted-foreground text-sm">Use tags to categorize visitors for easier searching and filtering</p>
                                {errors.tags && <p className="text-destructive text-sm">{errors.tags}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Additional notes about the visitor..."
                                    rows={4}
                                />
                                {errors.notes && <p className="text-destructive text-sm">{errors.notes}</p>}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_first_time"
                                        checked={data.is_first_time}
                                        onCheckedChange={(checked) => setData('is_first_time', !!checked)}
                                    />
                                    <Label htmlFor="is_first_time">First time visitor</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="wants_followup"
                                        checked={data.wants_followup}
                                        onCheckedChange={(checked) => setData('wants_followup', !!checked)}
                                    />
                                    <Label htmlFor="wants_followup">Wants follow-up contact</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="wants_newsletter"
                                        checked={data.wants_newsletter}
                                        onCheckedChange={(checked) => setData('wants_newsletter', !!checked)}
                                    />
                                    <Label htmlFor="wants_newsletter">Wants to receive newsletter</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end space-x-4">
                        <Button asChild variant="outline">
                            <Link href="/visitors">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Visitor'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
