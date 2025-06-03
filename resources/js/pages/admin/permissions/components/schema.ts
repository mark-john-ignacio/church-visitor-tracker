import * as z from 'zod';

export const permissionSchema = z.object({
    name: z.string().min(1, 'Name is required'),
});

export type FormData = z.infer<typeof permissionSchema>;

export function normalizePermissionData(values: Partial<FormData>): FormData {
    return {
        name: values.name ?? '',
    };
}
