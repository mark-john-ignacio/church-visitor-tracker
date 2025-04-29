import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { FormProvider, useForm as useReactHookForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Define breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: route('admin.index') },
    { title: 'Users', href: route('admin.users.index') },
    { title: 'Create', href: route('admin.users.create') },
];

// Define props
interface CreateUserPageProps extends PageProps {
    roles: Record<string, string>;
}

// Form data type
interface UserFormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    roles: string[];
}

// Zod schema
const formSchema = z
    .object({
        name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
        email: z.string().email({ message: 'Please enter a valid email address.' }),
        password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
        password_confirmation: z.string().min(8, { message: 'Password confirmation must be at least 8 characters.' }),
        roles: z.array(z.string()).min(1, { message: 'Please select at least one role.' }),
    })
    .refine((d) => d.password === d.password_confirmation, {
        message: "Passwords don't match",
        path: ['password_confirmation'],
    });

export default function CreateUser({ auth, roles }: CreateUserPageProps) {
    const [formData, setFormData] = useState<UserFormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [],
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // react-hook-form for validation
    const form = useReactHookForm<UserFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: formData,
    });

    useEffect(() => {
        form.reset(formData);
    }, [formData, form]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (roleName: string, checked: boolean) => {
        setFormData((prev) => {
            const list = checked ? [...prev.roles, roleName] : prev.roles.filter((r) => r !== roleName);
            return { ...prev, roles: list };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.handleSubmit(() => {
            setProcessing(true);

            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('password', formData.password);
            data.append('password_confirmation', formData.password_confirmation);
            formData.roles.forEach((r, i) => data.append(`roles[${i}]`, r));

            router.post(route('admin.users.store'), data, {
                onSuccess: () => {
                    toast.success('User Created', { description: 'The new user has been added successfully.' });
                    setFormData({ name: '', email: '', password: '', password_confirmation: '', roles: [] });
                    setErrors({});
                },
                onError: (pageErrors) => {
                    setErrors(pageErrors);
                    toast.error('Error Creating User', {
                        description: Object.values(pageErrors)[0] || 'Please check the form for errors.',
                    });
                },
                onFinish: () => setProcessing(false),
                preserveScroll: true,
            });
        })();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New User</CardTitle>
                        <CardDescription>Fill in the details to add a new user.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormProvider {...form}>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name */}
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} />
                                    </FormControl>
                                    {errors.name && <FormMessage>{errors.name}</FormMessage>}
                                </FormItem>

                                {/* Email */}
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            name="email"
                                            placeholder="user@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </FormControl>
                                    {errors.email && <FormMessage>{errors.email}</FormMessage>}
                                </FormItem>

                                {/* Password */}
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            name="password"
                                            placeholder="********"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                    </FormControl>
                                    {errors.password && <FormMessage>{errors.password}</FormMessage>}
                                </FormItem>

                                {/* Confirm Password */}
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            name="password_confirmation"
                                            placeholder="********"
                                            value={formData.password_confirmation}
                                            onChange={handleChange}
                                        />
                                    </FormControl>
                                    {errors.password_confirmation && <FormMessage>{errors.password_confirmation}</FormMessage>}
                                </FormItem>

                                {/* Roles */}
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">Roles</FormLabel>
                                        <FormDescription>Assign roles to the user.</FormDescription>
                                    </div>
                                    {Object.entries(roles).map(([id, name]) => (
                                        <FormItem key={id} className="mb-2 flex items-start space-x-3">
                                            <FormControl>
                                                <Checkbox
                                                    checked={formData.roles.includes(name)}
                                                    onCheckedChange={(checked) => handleRoleChange(name, !!checked)}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal capitalize">{name}</FormLabel>
                                        </FormItem>
                                    ))}
                                    {errors.roles && <FormMessage>{errors.roles}</FormMessage>}
                                </FormItem>

                                {/* Actions */}
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => router.visit(route('admin.users.index'))}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Creating...' : 'Create User'}
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
