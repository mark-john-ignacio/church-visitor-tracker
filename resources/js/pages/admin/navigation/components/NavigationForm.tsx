import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStandardForm } from '@/hooks/use-standard-form';
import { router } from '@inertiajs/react';
import { navigationSchema, normalizeNavigationData, type FormData } from './schema';

interface Props {
    defaultValues: Partial<FormData>;
    url: string;
    method: 'post' | 'put';
    parentItems: Record<string, string>;
    permissions: Record<string, string>;
    iconList: Record<string, string>;
    types: Record<string, string>;
    onSuccess?: () => void;
}

export function NavigationForm({ defaultValues, url, method, parentItems, permissions, iconList, types, onSuccess }: Props) {
    const normalizedDefaults = normalizeNavigationData(defaultValues);

    const form = useStandardForm({
        schema: navigationSchema,
        defaultValues: normalizedDefaults,
        url,
        method,
        onSuccess,
        successMessage: {
            create: 'Navigation item created successfully',
            update: 'Navigation item updated successfully',
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
                                <Input placeholder="Dashboard" {...field} />
                            </FormControl>
                            <FormDescription>Display name for the navigation item</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Route */}
                <FormField
                    control={form.control}
                    name="route"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Route</FormLabel>
                            <FormControl>
                                <Input placeholder="/dashboard or dashboard" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormDescription>URL path or named route (can be empty for parent items with children)</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Type */}
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Navigation Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Object.entries(types).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>Where this navigation item will appear</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Icon */}
                <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Icon</FormLabel>
                            <Select onValueChange={(value) => field.onChange(value === 'none' ? null : value)} value={field.value || 'none'}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select icon (optional)" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {Object.entries(iconList).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>Icon to display next to the navigation item</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Parent Item */}
                <FormField
                    control={form.control}
                    name="parent_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Parent Item</FormLabel>
                            <Select
                                onValueChange={(value) => field.onChange(value === 'none' ? null : Number(value))}
                                value={field.value?.toString() || 'none'}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select parent (optional)" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {Object.entries(parentItems).map(([id, name]) => (
                                        <SelectItem key={id} value={id}>
                                            {name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>Parent menu item (if this is a submenu item)</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Order */}
                <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Order</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min="0"
                                    step="1"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    value={field.value}
                                />
                            </FormControl>
                            <FormDescription>Display order (lower numbers appear first)</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Permission */}
                <FormField
                    control={form.control}
                    name="permission_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Required Permission</FormLabel>
                            <Select onValueChange={(value) => field.onChange(value === 'none' ? null : value)} value={field.value || 'none'}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select permission (optional)" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {Object.entries(permissions).map(([id, name]) => (
                                        <SelectItem key={id} value={name}>
                                            {name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>Permission required to see this navigation item</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => router.get(route('admin.navigation.index'))} disabled={form.isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={form.isSubmitting}>
                        {form.isSubmitting ? 'Processing...' : method === 'post' ? 'Create Navigation Item' : 'Update Navigation Item'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
