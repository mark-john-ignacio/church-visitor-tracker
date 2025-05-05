import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface Permission {
    id: number;
    name: string;
}

interface Props {
    defaultValues: {
        name: string;
        permissions: string[];
    };
    permissions: Record<string, string>;
    url: string;
    method: 'post' | 'put';
    onSuccess?: () => void;
}

const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    permissions: z.array(z.string()).min(1, 'At least one permission must be selected'),
});

export function RoleForm({ defaultValues, permissions, url, method, onSuccess }: Props) {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    useEffect(() => {
        form.reset(defaultValues);
    }, [defaultValues, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        router[method](url, values, {
            onSuccess: () => {
                toast.success(method === 'post' ? 'Role created successfully' : 'Role updated successfully');
                if (onSuccess) onSuccess();
            },
            onError: (errors) => {
                Object.keys(errors).forEach((key) => {
                    form.setError(key as any, {
                        type: 'manual',
                        message: errors[key],
                    });
                });
            },
        });
    }

    // Group permissions by their prefix
    const groupedPermissions = Object.entries(permissions).reduce<Record<string, { id: string; name: string }[]>>((groups, [id, name]) => {
        const parts = name.split('_');
        const prefix = parts.length > 1 ? parts[0] : 'other';

        if (!groups[prefix]) {
            groups[prefix] = [];
        }

        groups[prefix].push({ id, name });
        return groups;
    }, {});

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Name */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor="name">Name</FormLabel>
                            <FormControl>
                                <Input
                                    id="name"
                                    {...field}
                                    disabled={defaultValues.name === 'super_admin'}
                                    aria-invalid={!!form.formState.errors.name}
                                    aria-describedby="name-error"
                                />
                            </FormControl>
                            <FormMessage id="name-error">{form.formState.errors.name?.message}</FormMessage>
                        </FormItem>
                    )}
                />

                {/* Permissions */}
                <FormField
                    control={form.control}
                    name="permissions"
                    render={() => (
                        <FormItem>
                            <div>
                                <FormLabel>Permissions</FormLabel>
                                <p className="text-muted-foreground mb-2 text-sm">Select the permissions for this role</p>
                            </div>
                            <div className="rounded-md border p-4">
                                {Object.entries(groupedPermissions).map(([group, perms]) => (
                                    <div key={group} className="mb-6 last:mb-0">
                                        <h3 className="mb-2 text-sm font-semibold capitalize">{group}</h3>
                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                                            {perms.map((permission) => (
                                                <FormField
                                                    key={permission.id}
                                                    control={form.control}
                                                    name="permissions"
                                                    render={({ field }) => (
                                                        <FormItem className="flex items-center space-y-0 space-x-2">
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(permission.name)}
                                                                    onCheckedChange={(checked) => {
                                                                        const updatedValue = checked
                                                                            ? [...field.value, permission.name]
                                                                            : field.value.filter((val) => val !== permission.name);
                                                                        field.onChange(updatedValue);
                                                                    }}
                                                                    disabled={defaultValues.name === 'super_admin'}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="!m-0 cursor-pointer text-sm">{permission.name}</FormLabel>
                                                        </FormItem>
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <FormMessage>{form.formState.errors.permissions?.message}</FormMessage>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {method === 'post' ? 'Create' : 'Update'} Role
                    </Button>
                </div>
            </form>
        </Form>
    );
}
