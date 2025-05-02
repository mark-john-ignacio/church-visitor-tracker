import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps, User } from '@/types';

interface EditUserProps extends PageProps {
    user: User;
    roles: Record<string, string>;
}

interface FormData {
    name: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    roles: string[];
}

const schema = z
    .object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(8).optional(),
        password_confirmation: z.string().optional(),
        roles: z.array(z.string()).min(1),
    })
    .refine(
        (d) => {
            return !d.password || d.password === d.password_confirmation;
        },
        {
            path: ['password_confirmation'],
            message: "Passwords don't match",
        },
    );

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '#' },
    { title: 'Users', href: route('admin.users.index') },
    { title: 'Edit', href: route('admin.users.edit', { user: '' }) }, // will be replaced
];

export default function EditUser({ auth, user, roles }: EditUserProps) {
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const defaultValues: FormData = {
        name: user.name,
        email: user.email,
        password: undefined,
        password_confirmation: undefined,
        roles: user.roles?.map((r) => r.name) || [],
    };

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues,
    });

    useEffect(() => {
        form.reset(defaultValues);
    }, [user]);

    const onSubmit = form.handleSubmit((data) => {
        setProcessing(true);

        // send a plain JS object → Inertia will JSON.stringify it
        router.put(
            route('admin.users.update', { user: user.id }),
            {
                name: data.name,
                email: data.email,
                // only include password fields if set
                ...(data.password
                    ? {
                          password: data.password,
                          password_confirmation: data.password_confirmation!,
                      }
                    : {}),
                roles: data.roles,
            },
            {
                onSuccess: () => {
                    toast.success('User updated');
                    setErrors({});
                },
                onError: (errs) => {
                    setErrors(errs);
                    toast.error('Error updating user');
                },
                onFinish: () => setProcessing(false),
            },
        );
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs.map((b) => (b.title === 'Edit' ? { ...b, href: route('admin.users.edit', { user: user.id }) } : b))}>
            <Head title="Edit User" />

            <div className="p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit User</CardTitle>
                        <CardDescription>Change user details or roles.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormProvider {...form}>
                            <form onSubmit={onSubmit} className="space-y-6">
                                {/* Name */}
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input {...form.register('name')} />
                                    </FormControl>
                                    <FormMessage>{errors.name}</FormMessage>
                                </FormItem>

                                {/* Email */}
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" {...form.register('email')} />
                                    </FormControl>
                                    <FormMessage>{errors.email}</FormMessage>
                                </FormItem>

                                {/* Password */}
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...form.register('password')} />
                                    </FormControl>
                                    <FormDescription>Leave blank to keep current password.</FormDescription>
                                    <FormMessage>{errors.password}</FormMessage>
                                </FormItem>

                                {/* Confirm Password */}
                                <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...form.register('password_confirmation')} />
                                    </FormControl>
                                    <FormMessage>{errors.password_confirmation}</FormMessage>
                                </FormItem>

                                {/* Roles */}
                                <FormItem>
                                    <FormLabel>Roles</FormLabel>
                                    {Object.entries(roles).map(([id, name]) => (
                                        <div key={id} className="flex items-center space-x-2">
                                            <Checkbox {...form.register('roles')} value={name} />
                                            <span className="capitalize">{name}</span>
                                        </div>
                                    ))}
                                    <FormMessage>{errors.roles}</FormMessage>
                                </FormItem>

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => router.visit(route('admin.users.index'))}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Saving…' : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                        </FormProvider>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
