import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useStandardForm } from '@/hooks/use-standard-form';
import { router } from '@inertiajs/react';
import { normalizePermissionData, permissionSchema, type FormData } from './schema';

interface Props {
    defaultValues: Partial<FormData>;
    url: string;
    method: 'post' | 'put';
    isSystemPermission?: boolean;
    onSuccess?: () => void;
}

export function PermissionForm({ defaultValues, url, method, isSystemPermission = false, onSuccess }: Props) {
    const normalizedDefaults = normalizePermissionData(defaultValues);

    const form = useStandardForm({
        schema: permissionSchema,
        defaultValues: normalizedDefaults,
        url,
        method,
        onSuccess,
        successMessage: {
            create: 'Permission created successfully',
            update: 'Permission updated successfully',
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(form.submit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Permission Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., users.create" {...field} disabled={isSystemPermission} />
                            </FormControl>
                            <FormDescription>
                                {isSystemPermission
                                    ? 'System permissions cannot be modified'
                                    : 'Use dot notation for grouped permissions (e.g., users.create, roles.edit)'}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.get(route('admin.permissions.index'))}
                        disabled={form.isSubmitting || isSystemPermission}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={form.isSubmitting || isSystemPermission}>
                        {form.isSubmitting ? 'Processing...' : method === 'post' ? 'Create Permission' : 'Update Permission'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
