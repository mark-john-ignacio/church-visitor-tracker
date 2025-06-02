import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useStandardForm } from '@/hooks/use-standard-form';
import { router } from '@inertiajs/react';
import { roleSchema, type FormData } from './schema';

interface Props {
    defaultValues: FormData;
    permissions: Record<string, string>;
    url: string;
    method: 'post' | 'put';
    onSuccess?: () => void;
    disabled?: boolean;
}

export function RoleForm({ defaultValues, permissions, url, method, onSuccess, disabled = false }: Props) {
    const form = useStandardForm({
        schema: roleSchema,
        defaultValues,
        url,
        method,
        onSuccess,
        successMessage: {
            create: 'Role created successfully',
            update: 'Role updated successfully',
        },
    });

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

    const isSuperAdmin = defaultValues.name === 'super_admin';

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
                                <Input {...field} disabled={disabled || isSuperAdmin} />
                            </FormControl>
                            <FormMessage />
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
                                                                    disabled={disabled || isSuperAdmin}
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
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.get(route('admin.roles.index'))}
                        disabled={form.isSubmitting || disabled}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={form.isSubmitting || disabled}>
                        {form.isSubmitting ? 'Processing...' : method === 'post' ? 'Create Role' : 'Update Role'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
