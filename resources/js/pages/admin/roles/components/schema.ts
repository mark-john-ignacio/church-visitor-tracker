import * as z from 'zod';

export const roleSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    permissions: z.array(z.string()).min(1, 'At least one permission must be selected'),
});

export type FormData = z.infer<typeof roleSchema>;
