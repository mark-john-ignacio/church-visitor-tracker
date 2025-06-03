import * as z from 'zod';

export const navigationSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    route: z.string().nullable().optional(),
    type: z.string().min(1, 'Type is required'),
    icon: z.string().nullable().optional(),
    parent_id: z.number().nullable().optional(),
    order: z.number().min(0, 'Order must be 0 or greater'),
    permission_name: z.string().nullable().optional(),
});

export type FormData = z.infer<typeof navigationSchema>;

export function normalizeNavigationData(values: Partial<FormData>): FormData {
    return {
        name: values.name ?? '',
        route: values.route ?? null,
        type: values.type ?? '',
        icon: values.icon ?? null,
        parent_id: values.parent_id ?? null,
        order: values.order ?? 0,
        permission_name: values.permission_name ?? null,
    };
}
