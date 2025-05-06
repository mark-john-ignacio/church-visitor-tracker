import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface Props {
    defaultValues: {
        name: string;
    };
    url: string;
    method: 'post' | 'put';
    isSystemPermission?: boolean;
    onSuccess?: () => void;
}

const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
});

export function PermissionForm({ defaultValues, url, method, isSystemPermission = false, onSuccess }: Props) {
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
                toast.success(method === 'post' ? 'Permission created successfully' : 'Permission updated successfully');
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

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor="name">Permission Name</FormLabel>
                            <FormControl>
                                <Input
                                    id="name"
                                    {...field}
                                    disabled={isSystemPermission}
                                    aria-invalid={!!form.formState.errors.name}
                                    aria-describedby="name-error"
                                />
                            </FormControl>
                            <FormMessage id="name-error">{form.formState.errors.name?.message}</FormMessage>
                            {isSystemPermission && <p className="text-muted-foreground text-xs">System permissions cannot be modified</p>}
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button type="submit" disabled={form.formState.isSubmitting || isSystemPermission}>
                        {method === 'post' ? 'Create' : 'Update'} Permission
                    </Button>
                </div>
            </form>
        </Form>
    );
}
