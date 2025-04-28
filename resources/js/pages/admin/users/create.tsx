import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, useForm as useInertiaForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { useForm as useReactHookForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Define breadcrumbs (assuming route() is globally available)
const breadcrumbs: BreadcrumbItem[] = [
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
        roles: z.array(z.string()).min(1, { message: 'Please select at least one role.' }),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: "Passwords don't match",
        path: ['password_confirmation'],
    });

export default function CreateUser({ auth, roles }: CreateUserPageProps) {
    // Initialize react-hook-form for state management and validation
    const form = useReactHookForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '', // Removed duplicate
            email: '',
            password: '',
            password_confirmation: '',
            roles: [],
        },
    });

    // Define the type for the form data based on the Zod schema
    type FormData = z.infer<typeof formSchema>;

    // Inertia useForm hook - primarily for processing state, errors, and post method
    // Provide the FormData type to correctly type `errors`
    const {
        post,
        processing,
        errors,
        reset: resetInertiaForm,
    } = useInertiaForm<FormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [],
    }); // Provide initial values matching FormData

    // Update react-hook-form errors when Inertia returns validation errors
    useEffect(() => {
        // Clear previous server errors first if desired
        // form.clearErrors();

        if (errors.name) form.setError('name', { type: 'server', message: errors.name });
        if (errors.email) form.setError('email', { type: 'server', message: errors.email });
        if (errors.password) form.setError('password', { type: 'server', message: errors.password });
        if (errors.password_confirmation) form.setError('password_confirmation', { type: 'server', message: errors.password_confirmation });
        if (errors.roles) form.setError('roles', { type: 'server', message: errors.roles });
        // Add other fields if necessary
    }, [errors, form.setError]); // Add form.setError to dependency array

    // Handle form submission using react-hook-form's handleSubmit
    function onSubmit(values: z.infer<typeof formSchema>) {
        // Pass the validated 'values' from react-hook-form directly to Inertia's post method
        post(route('admin.users.store'), {
            ...values, // Spread the validated values from react-hook-form
            onSuccess: () => {
                toast.success('User Created', {
                    description: 'The new user has been added successfully.',
                });
                form.reset(); // Reset react-hook-form fields
                // resetInertiaForm(); // Optionally reset Inertia form state (like errors)
            },
            onError: () => {
                // Error messages are now set via the useEffect hook and shown by FormMessage
                toast.error('Error', {
                    description: 'Failed to create user. Please check the form for errors.',
                });
            },
            // Preserve state/scroll as needed
            preserveScroll: true,
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
                            {/* Pass react-hook-form's handleSubmit */}
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
                                            <FormMessage /> {/* Displays validation errors */}
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
                                {/* Roles Field */}
                                <FormField
                                    control={form.control}
                                    name="roles"
                                    render={() => (
                                        <FormItem>
                                            <div className="mb-4">
                                                <FormLabel className="text-base">Roles</FormLabel>
                                                <FormDescription>Assign roles to the user.</FormDescription>
                                            </div>
                                            {Object.entries(roles).map(([id, name]) => (
                                                <FormField
                                                    key={id}
                                                    control={form.control}
                                                    name="roles"
                                                    render={({ field }) => (
                                                        <FormItem key={id} className="mb-2 flex flex-row items-start space-y-0 space-x-3">
                                                            <FormControl>
                                                                <Checkbox
                                                                    // Check if the current role 'name' is in the array of selected roles
                                                                    checked={field.value?.includes(name)}
                                                                    onCheckedChange={(checked) => {
                                                                        const currentRoles = field.value || [];
                                                                        if (checked) {
                                                                            // Add the role name if checked
                                                                            field.onChange([...currentRoles, name]);
                                                                        } else {
                                                                            // Remove the role name if unchecked
                                                                            field.onChange(currentRoles.filter((value) => value !== name));
                                                                        }
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal capitalize">{name}</FormLabel>
                                                        </FormItem>
                                                    )}
                                                />
                                            ))}
                                            <FormMessage /> {/* Shows validation errors for the roles field */}
                                        </FormItem>
                                    )}
                                />

                                {/* Buttons */}
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => router.visit(route('admin.users.index'))}>
                                        Cancel
                                    </Button>
                                    {/* Disable button based on Inertia's processing state */}
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
