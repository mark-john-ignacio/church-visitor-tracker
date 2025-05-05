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
                    <FormLabel htmlFor="name">Name</FormLabel>
                    <FormControl>
                        <Input id="name" aria-invalid={!!form.formState.errors.name} aria-describedby="name-error" {...form.register('name')} />
                    </FormControl>
                    <FormMessage id="name-error">{form.formState.errors.name?.message}</FormMessage>
                </FormItem>

                {/* Email */}
                <FormItem>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <FormControl>
                        <Input
                            id="email"
                            type="email"
                            aria-invalid={!!form.formState.errors.email}
                            aria-describedby="email-error"
                            {...form.register('email')}
                        />
                    </FormControl>
                    <FormMessage id="email-error">{form.formState.errors.email?.message}</FormMessage>
                </FormItem>

                {/* Password */}
                <FormItem>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl>
                        <Input
                            id="password"
                            type="password"
                            aria-invalid={!!form.formState.errors.password}
                            aria-describedby={form.formState.errors.password ? 'password-error' : 'password-desc'}
                            {...form.register('password')}
                        />
                    </FormControl>
                    <FormDescription id="password-desc">Leave blank to keep existing</FormDescription>
                    <FormMessage id="password-error">{form.formState.errors.password?.message}</FormMessage>
                </FormItem>

                {/* Confirm */}
                <FormItem>
                    <FormLabel htmlFor="password_confirmation">Confirm</FormLabel>
                    <FormControl>
                        <Input
                            id="password_confirmation"
                            type="password"
                            aria-invalid={!!form.formState.errors.password_confirmation}
                            aria-describedby="password_confirmation-error"
                            {...form.register('password_confirmation')}
                        />
                    </FormControl>
                    <FormMessage id="password_confirmation-error">{form.formState.errors.password_confirmation?.message}</FormMessage>
                </FormItem>

                {/* Roles */}
                <FormItem>
                    <fieldset>
                        <legend className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Roles</legend>
                        <FormControl>
                            <Controller
                                control={form.control}
                                name="roles"
                                render={({ field }) => (
                                    <div className="mt-2 space-y-2" role="group" aria-labelledby="roles-legend" id="roles-group">
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
                                                    aria-describedby="roles-error"
                                                />
                                                <span>{name}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            />
                        </FormControl>
                        <FormMessage id="roles-error">{form.formState.errors.roles?.message}</FormMessage>
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
