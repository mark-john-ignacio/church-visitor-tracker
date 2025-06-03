import * as z from 'zod';

export const userSchema = z
    .object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email address'),
        password: z.string().optional(),
        password_confirmation: z.string().optional(),
        roles: z.array(z.string()).min(1, 'At least one role must be selected'),
    })
    .refine(
        (data) => {
            // Only validate password length if password is provided and not empty
            if (data.password && data.password.length > 0 && data.password.length < 8) {
                return false;
            }
            return true;
        },
        {
            message: 'Password must be at least 8 characters',
            path: ['password'],
        },
    )
    .refine(
        (data) => {
            // Only validate password confirmation if password is provided
            if (data.password && data.password.length > 0) {
                return data.password === data.password_confirmation;
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
        password: values.password && values.password.length > 0 ? values.password : undefined,
        password_confirmation: values.password_confirmation && values.password_confirmation.length > 0 ? values.password_confirmation : undefined,
        roles: Array.isArray(values.roles) ? values.roles : [],
    };
}
