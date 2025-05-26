import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useCallback, useEffect } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { FormData, schema } from './schema';

interface Props {
    defaultValues: FormData;
    roles: Record<string, string>;
    url: string;
    method: 'post' | 'put';
    onSuccess?: () => void;
    disabled?: boolean;
    superAdminExists?: boolean;
    isSuperAdmin?: boolean;
}

export function UserForm({ defaultValues, roles, url, method, onSuccess, disabled = false, superAdminExists = false, isSuperAdmin = false }: Props) {
    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues,
    });

    // Reset form on default values change
    useEffect(() => {
        form.reset(defaultValues);
    }, [defaultValues]);

    const submit = (data: FormData) => {
        if (disabled) return;

        router[method](url, data, {
            onSuccess: () => {
                toast.success('User saved successfully');
                onSuccess?.();
            },
            onError: (errors) => {
                if (errors.default) {
                    toast.error(errors.default);
                } else {
                    toast.error('Error saving user');
                }
            },
        });
    };

    const setRoleChecked = useCallback((field: any, role: string, checked: boolean) => {
        const newRoles = checked ? [...field.value, role] : field.value.filter((r: string) => r !== role);
        field.onChange(newRoles);
    }, []);

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
                {/* Name field */}
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

                {/* Email field */}
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

                {/* Password field */}
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

                {/* Password confirmation field */}
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
                            <fieldset>
                                <FormLabel className="text-base font-medium">Roles</FormLabel>
                                <FormControl>
                                    <Controller
                                        name="roles"
                                        control={form.control}
                                        render={({ field }) => (
                                            <div role="group" aria-labelledby="roles-legend" className="space-y-2 pt-1">
                                                {Object.entries(roles).map(([id, name]) => {
                                                    const isSuperAdminRole = name === 'super_admin';
                                                    const roleChecked = field.value.includes(name);
                                                    const disableCheck =
                                                        disabled ||
                                                        (isSuperAdminRole && superAdminExists && !roleChecked) ||
                                                        (isSuperAdminRole && roleChecked && isSuperAdmin);

                                                    return (
                                                        <label key={id} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                checked={roleChecked}
                                                                disabled={disableCheck}
                                                                onCheckedChange={(checked) => {
                                                                    setRoleChecked(field, name, !!checked);
                                                                }}
                                                                aria-label={`Role: ${name}`}
                                                                aria-invalid={!!form.formState.errors.roles}
                                                            />
                                                            <span>
                                                                {name}
                                                                {isSuperAdminRole && roleChecked && isSuperAdmin && (
                                                                    <span className="ml-2 text-sm text-orange-600">(Cannot be removed)</span>
                                                                )}
                                                                {isSuperAdminRole && superAdminExists && !roleChecked && (
                                                                    <span className="ml-2 text-sm text-orange-600">(Already assigned)</span>
                                                                )}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    />
                                </FormControl>
                                <FormMessage />
                            </fieldset>
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={disabled}>
                    Save User
                </Button>
            </form>
        </FormProvider>
    );
}
