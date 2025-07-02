import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { 
    Phone, 
    Mail, 
    MapPin, 
    Calendar, 
    User,
    Plus,
    Edit,
    Trash2,
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle
} from 'lucide-react';

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
    follow_ups?: FollowUp[];
    created_at: string;
    updated_at: string;
}

interface FollowUp {
    id: number;
    visitor_id: number;
    status: 'pending' | 'completed' | 'cancelled';
    method: 'phone' | 'email' | 'visit' | 'text';
    note: string;
    followed_up_by: string;
    scheduled_date?: string;
    completed_date?: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    visitor: Visitor;
    auth: any;
}

const statusIcons = {
    pending: <Clock className="h-4 w-4 text-yellow-500" />,
    completed: <CheckCircle className="h-4 w-4 text-green-500" />,
    cancelled: <XCircle className="h-4 w-4 text-red-500" />
};

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
};

export default function Show({ visitor, auth }: Props) {
    const [isFollowUpDialogOpen, setIsFollowUpDialogOpen] = useState(false);
    const [followUpData, setFollowUpData] = useState({
        method: 'phone',
        note: '',
        scheduled_date: '',
        status: 'pending'
    });

    const handleCreateFollowUp = (e: React.FormEvent) => {
        e.preventDefault();
        
        router.post(route('visitors.follow-ups.store', visitor.id), followUpData, {
            onSuccess: () => {
                setIsFollowUpDialogOpen(false);
                setFollowUpData({
                    method: 'phone',
                    note: '',
                    scheduled_date: '',
                    status: 'pending'
                });
            }
        });
    };

    const handleEditVisitor = () => {
        router.get(route('visitors.edit', visitor.id));
    };

    const handleDeleteVisitor = () => {
        if (confirm('Are you sure you want to delete this visitor?')) {
            router.delete(route('visitors.destroy', visitor.id));
        }
    };

    return (
        <AppLayout>
            <Head title={visitor.name} />
            
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">{visitor.name}</h1>
                        <p className="text-muted-foreground">
                            Visitor Details
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button onClick={handleEditVisitor} variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                        <Button onClick={handleDeleteVisitor} variant="destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Visitor Information Card */}
                <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Visitor Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="font-medium text-gray-900">{visitor.name}</h3>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {visitor.is_first_time && (
                                                <Badge variant="secondary">First Time</Badge>
                                            )}
                                            {visitor.wants_followup && (
                                                <Badge variant="outline">Wants Follow-up</Badge>
                                            )}
                                            {visitor.wants_newsletter && (
                                                <Badge variant="outline">Newsletter</Badge>
                                            )}
                                        </div>
                                    </div>

                                    {visitor.email && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail className="h-4 w-4" />
                                            {visitor.email}
                                        </div>
                                    )}

                                    {visitor.phone && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Phone className="h-4 w-4" />
                                            {visitor.phone}
                                        </div>
                                    )}

                                    {visitor.address && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="h-4 w-4" />
                                            {visitor.address}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="h-4 w-4" />
                                        Visit Date: {format(new Date(visitor.visit_date), 'MMM dd, yyyy')}
                                    </div>

                                    {visitor.service_type && (
                                        <div className="text-sm text-gray-600">
                                            <strong>Service:</strong> {visitor.service_type}
                                        </div>
                                    )}

                                    {visitor.age_group && (
                                        <div className="text-sm text-gray-600">
                                            <strong>Age Group:</strong> {visitor.age_group}
                                        </div>
                                    )}

                                    {visitor.how_did_you_hear && (
                                        <div className="text-sm text-gray-600">
                                            <strong>How did you hear about us:</strong> {visitor.how_did_you_hear}
                                        </div>
                                    )}

                                    {visitor.invited_by && (
                                        <div className="text-sm text-gray-600">
                                            <strong>Invited by:</strong> {visitor.invited_by}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {visitor.notes && (
                                <>
                                    <Separator />
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                                        <p className="text-sm text-gray-600">{visitor.notes}</p>
                                    </div>
                                </>
                            )}

                            {visitor.tags && visitor.tags.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {visitor.tags.map((tag, index) => (
                                                <Badge key={index} variant="secondary">{tag}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Follow-ups Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Follow-ups</CardTitle>
                                <Dialog open={isFollowUpDialogOpen} onOpenChange={setIsFollowUpDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Follow-up
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add Follow-up</DialogTitle>
                                            <DialogDescription>
                                                Create a new follow-up for {visitor.name}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleCreateFollowUp} className="space-y-4">
                                            <div>
                                                <Label htmlFor="method">Method</Label>
                                                <Select 
                                                    value={followUpData.method} 
                                                    onValueChange={(value) => setFollowUpData({...followUpData, method: value})}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="phone">Phone Call</SelectItem>
                                                        <SelectItem value="email">Email</SelectItem>
                                                        <SelectItem value="visit">Personal Visit</SelectItem>
                                                        <SelectItem value="text">Text Message</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="scheduled_date">Scheduled Date</Label>
                                                <Input
                                                    id="scheduled_date"
                                                    type="datetime-local"
                                                    value={followUpData.scheduled_date}
                                                    onChange={(e) => setFollowUpData({...followUpData, scheduled_date: e.target.value})}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="note">Notes</Label>
                                                <Textarea
                                                    id="note"
                                                    value={followUpData.note}
                                                    onChange={(e) => setFollowUpData({...followUpData, note: e.target.value})}
                                                    placeholder="Follow-up notes..."
                                                    required
                                                />
                                            </div>

                                            <div className="flex justify-end space-x-2">
                                                <Button type="button" variant="outline" onClick={() => setIsFollowUpDialogOpen(false)}>
                                                    Cancel
                                                </Button>
                                                <Button type="submit">
                                                    Create Follow-up
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {visitor.follow_ups && visitor.follow_ups.length > 0 ? (
                                <div className="space-y-4">
                                    {visitor.follow_ups.map((followUp) => (
                                        <div key={followUp.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    {statusIcons[followUp.status]}
                                                    <Badge className={statusColors[followUp.status]}>
                                                        {followUp.status}
                                                    </Badge>
                                                    <span className="text-sm font-medium capitalize">
                                                        {followUp.method}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {format(new Date(followUp.created_at), 'MMM dd, yyyy HH:mm')}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{followUp.note}</p>
                                            <div className="text-xs text-gray-500">
                                                By: {followUp.followed_up_by}
                                                {followUp.scheduled_date && (
                                                    <span> • Scheduled: {format(new Date(followUp.scheduled_date), 'MMM dd, yyyy HH:mm')}</span>
                                                )}
                                                {followUp.completed_date && (
                                                    <span> • Completed: {format(new Date(followUp.completed_date), 'MMM dd, yyyy HH:mm')}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No follow-ups yet</p>
                                    <p className="text-sm text-gray-400">Add a follow-up to track your interactions</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
