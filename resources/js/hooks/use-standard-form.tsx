import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
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
    }); // Keep a ref to track the previous defaultValues
    const prevDefaultValuesRef = useRef<z.infer<T> | undefined>(undefined);

    // Helper function to do deep comparison
    const deepEqual = (a: any, b: any): boolean => {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (typeof a !== typeof b) return false;

        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return false;
            return a.every((item, index) => deepEqual(item, b[index]));
        }

        if (typeof a === 'object' && typeof b === 'object') {
            const keysA = Object.keys(a);
            const keysB = Object.keys(b);
            if (keysA.length !== keysB.length) return false;
            return keysA.every((key) => deepEqual(a[key], b[key]));
        }

        return a === b;
    };

    // Only reset form when defaultValues actually change
    useEffect(() => {
        if (!deepEqual(prevDefaultValuesRef.current, defaultValues)) {
            prevDefaultValuesRef.current = defaultValues;
            form.reset(defaultValues);
        }
    }, [defaultValues, form.reset]);

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
