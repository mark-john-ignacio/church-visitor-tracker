import { Button } from '@/components/ui/button';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { schema, type FormData } from './schema';

interface Props {
    defaultValues: FormData;
    url: string;
    method: 'post' | 'put';
    parentItems: Record<string, string>;
    permissions: Record<string, string>;
    iconList: Record<string, string>;
    types: Record<string, string>;
    onSuccess?: () => void;
}

export function NavigationForm({ defaultValues, url, method, parentItems, permissions, iconList, types, onSuccess }: Props) {
    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues,
    });

    // Reset form when defaultValues change (editing different item)
    useEffect(() => {
        form.reset(defaultValues);
    }, [defaultValues]);

    const submit = (data: FormData) => {
        router[method](url, data, {
            onSuccess: () => {
                toast.success('Navigation item saved successfully');
                onSuccess?.();
            },
            onError: () => toast.error('Error saving navigation item'),
        });
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
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
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
                            <Select onValueChange={field.onChange} defaultValue={field.value || ''} value={field.value || ''}>
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
                                defaultValue={field.value?.toString() || 'none'}
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
                            <Select
                                onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                                defaultValue={field.value || 'none'}
                                value={field.value || 'none'}
                            >
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

                <Button type="submit" className="w-full">
                    Save Navigation Item
                </Button>
            </form>
        </FormProvider>
    );
}
