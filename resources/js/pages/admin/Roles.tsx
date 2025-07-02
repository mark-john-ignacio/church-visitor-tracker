import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Edit, Lock, Plus, Shield, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';

interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
}

interface Role {
    id: number;
    name: string;
    guard_name: string;
    permissions: Permission[];
    users_count: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    roles: Role[];
    permissions: Permission[];
    auth: any;
}

export default function Roles({ roles, permissions, auth }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    const { data, setData, post, put, reset, processing, errors } = useForm({
        name: '',
        permissions: [] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingRole) {
            put(route('admin.roles.update', editingRole.id), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setEditingRole(null);
                    reset();
                },
            });
        } else {
            post(route('admin.roles.store'), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                },
            });
        }
    };

    const openDialog = (role?: Role) => {
        if (role) {
            setEditingRole(role);
            setData({
                name: role.name,
                permissions: role.permissions.map((p) => p.name),
            });
        } else {
            setEditingRole(null);
            reset();
        }
        setIsDialogOpen(true);
    };

    const deleteRole = (id: number) => {
        if (confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
            router.delete(route('admin.roles.destroy', id));
        }
    };

    const togglePermission = (permissionName: string) => {
        const currentPermissions = data.permissions;
        if (currentPermissions.includes(permissionName)) {
            setData(
                'permissions',
                currentPermissions.filter((p) => p !== permissionName),
            );
        } else {
            setData('permissions', [...currentPermissions, permissionName]);
        }
    };

    const selectAllPermissions = () => {
        setData(
            'permissions',
            permissions.map((p) => p.name),
        );
    };

    const clearAllPermissions = () => {
        setData('permissions', []);
    };

    // Group permissions by category
    const permissionGroups = permissions.reduce(
        (groups, permission) => {
            const category = permission.name.split('_')[1] || 'general';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(permission);
            return groups;
        },
        {} as Record<string, Permission[]>,
    );

    return (
        <AppLayout>
            <Head title="Roles & Permissions" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Roles & Permissions</h1>
                        <p className="text-muted-foreground">Manage user roles and permissions</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => openDialog()}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Role
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingRole ? 'Edit Role' : 'Create Role'}</DialogTitle>
                                <DialogDescription>
                                    {editingRole ? 'Update the role name and permissions.' : 'Create a new role and assign permissions.'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Role Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={errors.name ? 'border-red-500' : ''}
                                        placeholder="e.g., Staff, Volunteer, Admin"
                                        required
                                    />
                                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Permissions</Label>
                                        <div className="space-x-2">
                                            <Button type="button" variant="outline" size="sm" onClick={selectAllPermissions}>
                                                Select All
                                            </Button>
                                            <Button type="button" variant="outline" size="sm" onClick={clearAllPermissions}>
                                                Clear All
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {Object.entries(permissionGroups).map(([category, categoryPermissions]) => (
                                            <div key={category} className="rounded-lg border p-4">
                                                <h4 className="mb-3 font-medium capitalize">{category}</h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {categoryPermissions.map((permission) => (
                                                        <div key={permission.id} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`permission-${permission.id}`}
                                                                checked={data.permissions.includes(permission.name)}
                                                                onCheckedChange={() => togglePermission(permission.name)}
                                                            />
                                                            <Label htmlFor={`permission-${permission.id}`} className="text-sm">
                                                                {permission.name.replace(/_/g, ' ')}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? (editingRole ? 'Updating...' : 'Creating...') : editingRole ? 'Update Role' : 'Create Role'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card>
                        <CardContent className="flex items-center p-6">
                            <Shield className="h-8 w-8 text-blue-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Roles</p>
                                    <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="flex items-center p-6">
                                <Lock className="h-8 w-8 text-green-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Permissions</p>
                                    <p className="text-2xl font-bold text-gray-900">{permissions.length}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="flex items-center p-6">
                                <Users className="h-8 w-8 text-purple-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Users with Roles</p>
                                    <p className="text-2xl font-bold text-gray-900">{roles.reduce((sum, role) => sum + role.users_count, 0)}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Roles List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Roles Management</CardTitle>
                            <CardDescription>Manage user roles and their associated permissions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {roles.length > 0 ? (
                                <div className="space-y-4">
                                    {roles.map((role) => (
                                        <div key={role.id} className="rounded-lg border p-6">
                                            <div className="mb-4 flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold">{role.name}</h3>
                                                    <p className="text-sm text-gray-600">
                                                        {role.users_count} user{role.users_count !== 1 ? 's' : ''} • {role.permissions.length}{' '}
                                                        permission{role.permissions.length !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button onClick={() => openDialog(role)} variant="outline" size="sm">
                                                        <Edit className="mr-1 h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        onClick={() => deleteRole(role.id)}
                                                        variant="destructive"
                                                        size="sm"
                                                        disabled={role.name === 'Super Admin'}
                                                    >
                                                        <Trash2 className="mr-1 h-4 w-4" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>

                                            <Separator className="mb-4" />

                                            <div>
                                                <h4 className="mb-2 font-medium">Permissions:</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {role.permissions.length > 0 ? (
                                                        role.permissions.map((permission) => (
                                                            <Badge key={permission.id} variant="secondary">
                                                                {permission.name.replace(/_/g, ' ')}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <p className="text-sm text-gray-500">No permissions assigned</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <Shield className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                    <h3 className="mb-2 text-lg font-medium text-gray-900">No roles found</h3>
                                    <p className="mb-4 text-gray-500">Get started by creating your first user role.</p>
                                    <Button onClick={() => openDialog()}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Role
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
        </AppLayout>
    );
}
