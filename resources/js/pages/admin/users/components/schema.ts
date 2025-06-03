import * as z from 'zod';

export const userSchema = z
    .object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters').optional(),
        password_confirmation: z.string().optional(),
        roles: z.array(z.string()).min(1, 'At least one role must be selected'),
    })
    .refine(
        (data) => {
            if (data.password && data.password !== data.password_confirmation) {
                return false;
            }
            return true;
        },
        {
            message: "Passwords don't match",
            path: ['password_confirmation'],
        },
    );

export type FormData = z.infer<typeof userSchema>;

export function normalizeUserData(values: Partial<FormData>): FormData {
    return {
        name: values.name ?? '',
        email: values.email ?? '',
        password: values.password ?? undefined,
        password_confirmation: values.password_confirmation ?? undefined,
        roles: values.roles ?? [],
    };
}
