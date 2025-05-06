import { z } from 'zod';

export const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    route: z.string().nullable(),
    icon: z.string().nullable(),
    permission_name: z.string().nullable(),
    parent_id: z.number().nullable(),
    order: z.number().min(0, 'Order must be 0 or greater'),
    type: z.string().min(1, 'Type is required'),
});

export type FormData = z.infer<typeof schema>;
