import { z } from 'zod';

export const schema = z
    .object({
        name: z.string().min(2, 'Name is required'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters').optional(),
        password_confirmation: z.string().optional(),
        roles: z.array(z.string()).min(1, 'Select at least one role'),
    })
    .superRefine((data, ctx) => {
        if (data.password && data.password !== data.password_confirmation) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['password_confirmation'],
                message: 'Passwords must match',
            });
        }
    });

export type FormData = z.infer<typeof schema>;
