import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { FormData, schema } from './schema';

interface Props {
    defaultValues: FormData;
    roles: Record<string, string>;
    url: string;
    method: 'post' | 'put';
    onSuccess?: () => void;
}

export function UserForm({ defaultValues, roles, url, method, onSuccess }: Props) {
    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues,
    });

    // reset on edit
    useEffect(() => {
        form.reset(defaultValues);
    }, [defaultValues]);

    const submit = (data: FormData) => {
        router[method](url, data, {
            onSuccess: () => {
                toast.success('Saved.');
                onSuccess?.();
            },
            onError: () => toast.error('Error saving.'),
        });
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
                {/* Name */}
                <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input {...form.register('name')} />
                    </FormControl>
                    <FormMessage>{form.formState.errors.name?.message}</FormMessage>
                </FormItem>

                {/* Email */}
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input type="email" {...form.register('email')} />
                    </FormControl>
                    <FormMessage>{form.formState.errors.email?.message}</FormMessage>
                </FormItem>

                {/* Password */}
                <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                        <Input type="password" {...form.register('password')} />
                    </FormControl>
                    <FormDescription>Leave blank to keep existing</FormDescription>
                    <FormMessage>{form.formState.errors.password?.message}</FormMessage>
                </FormItem>

                {/* Confirm */}
                <FormItem>
                    <FormLabel>Confirm</FormLabel>
                    <FormControl>
                        <Input type="password" {...form.register('password_confirmation')} />
                    </FormControl>
                    <FormMessage>{form.formState.errors.password_confirmation?.message}</FormMessage>
                </FormItem>

                {/* Roles */}
                <FormItem>
                    <fieldset>
                        <FormLabel>Roles</FormLabel>
                        <FormControl>
                            <Controller
                                control={form.control}
                                name="roles"
                                render={({ field }) => (
                                    <div className="space-y-2" role="group" aria-labelledby="roles-label">
                                        {Object.entries(roles).map(([id, name]) => (
                                            <label key={id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    checked={field.value.includes(name)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            field.onChange([...field.value, name]);
                                                        } else {
                                                            field.onChange(field.value.filter((v) => v !== name));
                                                        }
                                                    }}
                                                    aria-invalid={!!form.formState.errors.roles}
                                                />
                                                <span>{name}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            />
                        </FormControl>
                        <FormMessage>{form.formState.errors.roles?.message}</FormMessage>
                    </fieldset>
                </FormItem>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.visit(route('admin.users.index'))}>
                        Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </FormProvider>
    );
}
