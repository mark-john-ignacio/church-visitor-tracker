// filepath: resources/js/pages/admin/users/create.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox'; // Alternative for roles
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, useForm as useInertiaForm } from '@inertiajs/react'; // Renamed Inertia useForm
import { useEffect } from 'react';
import { useForm } from 'react-hook-form'; // Import useForm from react-hook-form
import { toast } from 'sonner';
import { z } from 'zod';

// Define breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Admin', href: route('admin.index') },
    { title: 'Users', href: route('admin.users.index') },
    { title: 'Create', href: route('admin.users.create') },
];

// Define props including roles passed from controller
interface CreateUserPageProps extends PageProps {
    roles: Record<string, string>; // Expecting { id: name }
}

// Define Zod schema for validation
const formSchema = z
    .object({
        name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
        email: z.string().email({ message: 'Please enter a valid email address.' }),
        password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
        password_confirmation: z.string().min(8, { message: 'Password confirmation must be at least 8 characters.' }),
        // Use array of strings for roles
        roles: z.array(z.string()).min(1, { message: 'Please select at least one role.' }),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: "Passwords don't match",
        path: ['password_confirmation'], // path of error
    });

export default function CreateUser({ auth, roles }: CreateUserPageProps) {
    // Initialize react-hook-form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            roles: [], // Default to empty array
    });

    // Inertia useForm hook for submission
    const { data, setData, post, processing, errors, reset, wasSuccessful } = useInertiaForm({ // Use the renamed hook
        name: '',
        email: '',
        password: '',
        password: '',
        password_confirmation: '',
        roles: [] as string[], // Ensure type is string array
    });
    // Sync react-hook-form state with Inertia form helper state
    useEffect(() => {
        const subscription = form.watch((value) => {
            // Update Inertia form data when react-hook-form changes
            setData({
                name: value.name ?? '',
                email: value.email ?? '',
                password: value.password ?? '',
                password_confirmation: value.password_confirmation ?? '',
                roles: value.roles ?? [],
            });
        });
        return () => subscription.unsubscribe();
    }, [form.watch, setData]); // Watch for changes in react-hook-form

    // Update react-hook-form errors from Inertia errors
    // Update react-hook-form errors from Inertia errors
    useEffect(() => {
        if (errors.name) form.setError('name', { type: 'manual', message: errors.name });
        if (errors.email) form.setError('email', { type: 'manual', message: errors.email });
        if (errors.password) form.setError('password', { type: 'manual', message: errors.password });
    // Handle form submission
    function onSubmit(values: z.infer<typeof formSchema>) {
        // Use the data managed by Inertia's useForm for submission
        post(route('admin.users.store'), {
            // POST to the store route (we'll create this next)
            onSuccess: () => {
                toast.success('User Created', {
        post(route('admin.users.store'), {
            // POST to the store route (we'll create this next)
            onSuccess: () => {
                toast.success('User Created', {
                    description: 'The new user has been added successfully',
                });
                form.reset(); // Reset react-hook-form
            },
            onError: () => {
                toast.error('Error', {
                    description: errors.email || errors.name || errors.password || errors.roles || 'Failed to create user. Please check the form.',
                });
            },
        });
    }

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
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Name Field */}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Email Field */}
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="user@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Password Field */}
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="********" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Password Confirmation Field */}
                                <FormField
                                    control={form.control}
                                    name="password_confirmation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="********" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Roles Field (using Checkboxes) */}
                                <FormField
                                    control={form.control}
                                    name="roles"
                                    render={() => (
                                        <FormItem>
                                            <div className="mb-4">
                                                <FormLabel className="text-base">Roles</FormLabel>
                                                <FormDescription>Assign roles to the user.</FormDescription>
                                            </div>
                                            {Object.entries(roles).map(
                                                (
                                                    [id, name], // Use id from roles object
                                                ) => (
                                                    <FormField
                                                        key={id}
                                                        control={form.control}
                                                        name="roles"
                                                        render={({ field }) => {
                                                            return (
                                                                <FormItem key={id} className="mb-2 flex flex-row items-start space-y-0 space-x-3">
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(name)} // Check if role name is included
                                                                            onCheckedChange={(checked) => {
                                                                                return checked
                                                                                    ? field.onChange([...field.value, name]) // Add role name
                                                                                    : field.onChange(
                                                                                          field.value?.filter(
                                                                                              (value) => value !== name, // Remove role name
                                                                                          ),
                                                                                      );
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal capitalize">{name}</FormLabel>
                                                                </FormItem>
                                                            );
                                                        }}
                                                    />
                                                ),
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => router.visit(route('admin.users.index'))}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Creating...' : 'Create User'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
