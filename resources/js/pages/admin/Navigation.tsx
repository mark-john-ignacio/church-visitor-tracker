import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Edit, Menu, Navigation, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

interface MenuItem {
    id: number;
    title: string;
    url: string;
    icon?: string;
    order: number;
    is_active: boolean;
    permission?: string;
    target?: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    menuItems: MenuItem[];
    auth: any;
}

export default function Navigation({ menuItems, auth }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    const { data, setData, post, put, reset, processing, errors } = useForm({
        title: '',
        url: '',
        icon: '',
        permission: '',
        target: '_self',
        description: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingItem) {
            put(route('admin.navigation.update', editingItem.id), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setEditingItem(null);
                    reset();
                },
            });
        } else {
            post(route('admin.navigation.store'), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                },
            });
        }
    };

    const openDialog = (item?: MenuItem) => {
        if (item) {
            setEditingItem(item);
            setData({
                title: item.title,
                url: item.url,
                icon: item.icon || '',
                permission: item.permission || '',
                target: item.target || '_self',
                description: item.description || '',
                is_active: item.is_active,
            });
        } else {
            setEditingItem(null);
            reset();
        }
        setIsDialogOpen(true);
    };

    const deleteItem = (id: number) => {
        if (confirm('Are you sure you want to delete this menu item?')) {
            router.delete(route('admin.navigation.destroy', id));
        }
    };

    const moveItem = (id: number, direction: 'up' | 'down') => {
        router.patch(route('admin.navigation.reorder', id), {
            direction,
        });
    };

    const toggleActive = (id: number, is_active: boolean) => {
        router.patch(route('admin.navigation.toggle', id), {
            is_active: !is_active,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl leading-tight font-semibold text-gray-800">Navigation Management</h2>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => openDialog()}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Menu Item
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
                                <DialogDescription>
                                    {editingItem ? 'Update the menu item details.' : 'Create a new menu item for the sidebar navigation.'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className={errors.title ? 'border-red-500' : ''}
                                        required
                                    />
                                    {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="url">URL *</Label>
                                    <Input
                                        id="url"
                                        value={data.url}
                                        onChange={(e) => setData('url', e.target.value)}
                                        placeholder="/dashboard, /visitors, etc."
                                        className={errors.url ? 'border-red-500' : ''}
                                        required
                                    />
                                    {errors.url && <p className="text-sm text-red-600">{errors.url}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="icon">Icon</Label>
                                    <Input
                                        id="icon"
                                        value={data.icon}
                                        onChange={(e) => setData('icon', e.target.value)}
                                        placeholder="dashboard, users, settings"
                                    />
                                    <p className="text-xs text-gray-500">Use Lucide icon names (optional)</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="permission">Permission</Label>
                                    <Input
                                        id="permission"
                                        value={data.permission}
                                        onChange={(e) => setData('permission', e.target.value)}
                                        placeholder="view_dashboard, manage_users"
                                    />
                                    <p className="text-xs text-gray-500">Required permission to see this menu item (optional)</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="target">Target</Label>
                                    <Select value={data.target} onValueChange={(value) => setData('target', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="_self">Same window</SelectItem>
                                            <SelectItem value="_blank">New window</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Brief description of this menu item"
                                        rows={2}
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', !!checked)}
                                    />
                                    <Label htmlFor="is_active">Active</Label>
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? (editingItem ? 'Updating...' : 'Creating...') : editingItem ? 'Update' : 'Create'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            }
        >
            <Head title="Navigation Management" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Navigation className="h-5 w-5" />
                                Sidebar Navigation Items
                            </CardTitle>
                            <CardDescription>
                                Manage the navigation menu items that appear in the sidebar. Items are displayed in the order shown below.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {menuItems.length > 0 ? (
                                <div className="space-y-2">
                                    {menuItems.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className={`flex items-center justify-between rounded-lg border p-4 ${
                                                item.is_active ? 'bg-white' : 'bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="flex flex-col space-y-1">
                                                    <Button
                                                        onClick={() => moveItem(item.id, 'up')}
                                                        disabled={index === 0}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        <ArrowUp className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => moveItem(item.id, 'down')}
                                                        disabled={index === menuItems.length - 1}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        <ArrowDown className="h-3 w-3" />
                                                    </Button>
                                                </div>

                                                <div className="flex-1">
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <h3 className="font-medium">{item.title}</h3>
                                                        {!item.is_active && <Badge variant="secondary">Inactive</Badge>}
                                                        {item.permission && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {item.permission}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        URL: <code className="rounded bg-gray-100 px-1">{item.url}</code>
                                                        {item.icon && (
                                                            <span className="ml-2">
                                                                Icon: <code className="rounded bg-gray-100 px-1">{item.icon}</code>
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.description && <p className="mt-1 text-sm text-gray-500">{item.description}</p>}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    onClick={() => toggleActive(item.id, item.is_active)}
                                                    variant={item.is_active ? 'outline' : 'default'}
                                                    size="sm"
                                                >
                                                    {item.is_active ? 'Deactivate' : 'Activate'}
                                                </Button>
                                                <Button onClick={() => openDialog(item)} variant="outline" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button onClick={() => deleteItem(item.id)} variant="destructive" size="sm">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <Menu className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                    <h3 className="mb-2 text-lg font-medium text-gray-900">No menu items</h3>
                                    <p className="mb-4 text-gray-500">Get started by adding your first navigation item.</p>
                                    <Button onClick={() => openDialog()}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Menu Item
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
