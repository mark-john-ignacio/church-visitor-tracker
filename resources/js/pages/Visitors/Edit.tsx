import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { X } from 'lucide-react';
import React from 'react';

interface Visitor {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    visit_date: string;
    invited_by?: string;
    service_type?: string;
    is_first_time: boolean;
    age_group?: string;
    how_did_you_hear?: string;
    wants_followup: boolean;
    wants_newsletter: boolean;
    notes?: string;
    tags?: string[];
}

interface Props {
    visitor: Visitor;
    auth: any;
    errors: Record<string, string>;
}

export default function Edit({ visitor, auth, errors }: Props) {
    const { data, setData, put, processing } = useForm({
        name: visitor.name || '',
        email: visitor.email || '',
        phone: visitor.phone || '',
        address: visitor.address || '',
        visit_date: visitor.visit_date ? visitor.visit_date.split('T')[0] : '',
        invited_by: visitor.invited_by || '',
        service_type: visitor.service_type || '',
        is_first_time: visitor.is_first_time || false,
        age_group: visitor.age_group || '',
        how_did_you_hear: visitor.how_did_you_hear || '',
        wants_followup: visitor.wants_followup || false,
        wants_newsletter: visitor.wants_newsletter || false,
        notes: visitor.notes || '',
        tags: visitor.tags || [],
    });

    const [newTag, setNewTag] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('visitors.update', visitor.id));
    };

    const addTag = () => {
        if (newTag.trim() && !data.tags.includes(newTag.trim())) {
            setData('tags', [...data.tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setData(
            'tags',
            data.tags.filter((tag) => tag !== tagToRemove),
        );
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl leading-tight font-semibold text-gray-800">Edit Visitor: {visitor.name}</h2>}
        >
            <Head title={`Edit ${visitor.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Visitor Information</CardTitle>
                            <CardDescription>Update the visitor's details and preferences.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Information */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className={errors.name ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className={errors.email ? 'border-red-500' : ''}
                                        />
                                        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className={errors.phone ? 'border-red-500' : ''}
                                        />
                                        {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="visit_date">Visit Date *</Label>
                                        <Input
                                            id="visit_date"
                                            type="date"
                                            value={data.visit_date}
                                            onChange={(e) => setData('visit_date', e.target.value)}
                                            className={errors.visit_date ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.visit_date && <p className="text-sm text-red-600">{errors.visit_date}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className={errors.address ? 'border-red-500' : ''}
                                        rows={2}
                                    />
                                    {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
                                </div>

                                {/* Visit Information */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="invited_by">Invited By</Label>
                                        <Input id="invited_by" value={data.invited_by} onChange={(e) => setData('invited_by', e.target.value)} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="service_type">Service Type</Label>
                                        <Select value={data.service_type} onValueChange={(value) => setData('service_type', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select service type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Sunday Service">Sunday Service</SelectItem>
                                                <SelectItem value="Wednesday Service">Wednesday Service</SelectItem>
                                                <SelectItem value="Special Event">Special Event</SelectItem>
                                                <SelectItem value="Youth Service">Youth Service</SelectItem>
                                                <SelectItem value="Small Group">Small Group</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="age_group">Age Group</Label>
                                        <Select value={data.age_group} onValueChange={(value) => setData('age_group', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select age group" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="child">Child (0-12)</SelectItem>
                                                <SelectItem value="teen">Teen (13-17)</SelectItem>
                                                <SelectItem value="young_adult">Young Adult (18-25)</SelectItem>
                                                <SelectItem value="adult">Adult (26-64)</SelectItem>
                                                <SelectItem value="senior">Senior (65+)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="how_did_you_hear">How did you hear about us?</Label>
                                        <Select value={data.how_did_you_hear} onValueChange={(value) => setData('how_did_you_hear', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Friend/Family">Friend/Family</SelectItem>
                                                <SelectItem value="Website">Website</SelectItem>
                                                <SelectItem value="Social Media">Social Media</SelectItem>
                                                <SelectItem value="Advertisement">Advertisement</SelectItem>
                                                <SelectItem value="Walked By">Walked By</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Preferences */}
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
                                        <Label htmlFor="wants_newsletter">Subscribe to newsletter</Label>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="space-y-2">
                                    <Label>Tags</Label>
                                    <div className="mb-2 flex flex-wrap gap-2">
                                        {data.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="pr-1">
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="ml-1 rounded-full p-0.5 hover:bg-gray-300"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Add a tag..."
                                            className="flex-1"
                                        />
                                        <Button type="button" onClick={addTag} variant="outline">
                                            Add
                                        </Button>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Additional notes about the visitor..."
                                        rows={4}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end space-x-2">
                                    <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Updating...' : 'Update Visitor'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
