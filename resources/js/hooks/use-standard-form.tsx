import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface UseStandardFormOptions<T extends z.ZodType> {
    schema: T;
    defaultValues: z.infer<T>;
    url: string;
    method: 'post' | 'put';
    onSuccess?: () => void;
    onError?: (errors: Record<string, string>) => void;
    successMessage?: {
        create: string;
        update: string;
    };
    preserveScroll?: boolean;
}

export function useStandardForm<T extends z.ZodType>({
    schema,
    defaultValues,
    url,
    method,
    onSuccess,
    onError,
    successMessage = {
        create: 'Created successfully',
        update: 'Updated successfully',
    },
    preserveScroll = true,
}: UseStandardFormOptions<T>): UseFormReturn<z.infer<T>> & {
    submit: (data: z.infer<T>) => void;
    isSubmitting: boolean;
} {
    const form = useForm<z.infer<T>>({
        resolver: zodResolver(schema),
        defaultValues,
    });

    // Reset form when defaultValues change
    useEffect(() => {
        form.reset(defaultValues);
    }, [defaultValues, form]);

    const submit = (data: z.infer<T>) => {
        router[method](url, data, {
            preserveScroll,
            onSuccess: () => {
                toast.success(method === 'post' ? successMessage.create : successMessage.update);
                onSuccess?.();
            },
            onError: (errors) => {
                // Handle server validation errors
                Object.keys(errors).forEach((key) => {
                    if (key === 'default' || key === 'message') {
                        toast.error(errors[key]);
                    } else {
                        form.setError(key as any, {
                            type: 'manual',
                            message: errors[key],
                        });
                    }
                });
                onError?.(errors);
            },
        });
    };

    return {
        ...form,
        submit,
        isSubmitting: form.formState.isSubmitting,
    };
}
