import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useStandardForm } from '@/hooks/use-standard-form';
import { router } from '@inertiajs/react';
import { normalizeUserData, userSchema, type FormData } from './schema';

interface Props {
    defaultValues: Partial<FormData>;
    roles: Record<string, string>;
    url: string;
    method: 'post' | 'put';
    onSuccess?: () => void;
    disabled?: boolean;
    superAdminExists?: boolean;
    isSuperAdmin?: boolean;
}

export function UserForm({ defaultValues, roles, url, method, onSuccess, disabled = false, superAdminExists = false, isSuperAdmin = false }: Props) {
    const normalizedDefaults = normalizeUserData(defaultValues);

    const form = useStandardForm({
        schema: userSchema,
        defaultValues: normalizedDefaults,
        url,
        method,
        onSuccess,
        successMessage: {
            create: 'User created successfully',
            update: 'User updated successfully',
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(form.submit)} className="space-y-6">
                {/* Name */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} disabled={disabled} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Email */}
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="john@example.com" type="email" {...field} disabled={disabled} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Password */}
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{method === 'put' ? 'New Password' : 'Password'}</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} value={field.value || ''} disabled={disabled} />
                            </FormControl>
                            <FormDescription>{method === 'put' ? 'Leave blank to keep current password' : 'Enter a strong password'}</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Password Confirmation */}
                <FormField
                    control={form.control}
                    name="password_confirmation"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} value={field.value || ''} disabled={disabled} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Roles */}
                <FormField
                    control={form.control}
                    name="roles"
                    render={({ field }) => (
                        <FormItem>
                            <div className="mb-4">
                                <FormLabel className="text-base">Roles</FormLabel>
                                <FormDescription>Select the roles for this user</FormDescription>
                            </div>
                            <div className="space-y-3 rounded-md border p-4">
                                {Object.entries(roles).map(([id, name]) => {
                                    const isSuperAdminRole = name === 'super_admin';
                                    const isChecked = field.value?.includes(name) || false;
                                    const shouldDisable =
                                        disabled ||
                                        (isSuperAdminRole && superAdminExists && !isChecked) ||
                                        (isSuperAdminRole && isChecked && isSuperAdmin);

                                    return (
                                        <FormItem key={id} className="flex flex-row items-start space-y-0 space-x-3">
                                            <FormControl>
                                                <Checkbox
                                                    checked={isChecked}
                                                    disabled={shouldDisable}
                                                    onCheckedChange={(checked) => {
                                                        const currentRoles = field.value || [];
                                                        const updatedRoles = checked
                                                            ? [...currentRoles, name]
                                                            : currentRoles.filter((value) => value !== name);
                                                        field.onChange(updatedRoles);
                                                    }}
                                                />
                                            </FormControl>
                                            <div className="grid gap-1.5 leading-none">
                                                <FormLabel className="cursor-pointer text-sm font-normal">
                                                    {name}
                                                    {isSuperAdminRole && isChecked && isSuperAdmin && (
                                                        <span className="ml-2 text-xs text-orange-600">(Cannot be removed)</span>
                                                    )}
                                                    {isSuperAdminRole && superAdminExists && !isChecked && (
                                                        <span className="ml-2 text-xs text-orange-600">(Already assigned)</span>
                                                    )}
                                                </FormLabel>
                                            </div>
                                        </FormItem>
                                    );
                                })}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.get(route('admin.users.index'))}
                        disabled={form.isSubmitting || disabled}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={form.isSubmitting || disabled}>
                        {form.isSubmitting ? 'Processing...' : method === 'post' ? 'Create User' : 'Update User'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
