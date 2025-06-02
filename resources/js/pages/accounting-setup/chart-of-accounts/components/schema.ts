import type { ChartOfAccount } from '@/types';
import * as z from 'zod';

export const chartOfAccountSchema = z
    .object({
        account_code: z.string().min(1, 'Account code is required'),
        account_name: z.string().min(1, 'Account name is required'),
        account_category: z.string().min(1, 'Account category is required'),
        account_type: z.enum(['General', 'Detail'], {
            required_error: 'Account type is required',
        }),
        is_contra_account: z.boolean(),
        level: z.number().min(1).max(5, 'Level must be between 1 and 5'),
        header_account_id: z.number().nullable().optional(),
        description: z.string().nullable().optional(),
        is_active: z.boolean(),
    })
    .refine((d) => d.level === 1 || d.header_account_id, {
        message: 'Header account is required for levels 2-5',
        path: ['header_account_id'],
    })
    .refine((d) => d.level > 1 || !d.header_account_id, {
        message: 'Header account should be empty for level 1',
        path: ['header_account_id'],
    });

export type FormData = z.infer<typeof chartOfAccountSchema>;

export function normalizeChartOfAccount(values: Partial<ChartOfAccount>): FormData {
    return {
        account_code: values.account_code ?? '',
        account_name: values.account_name ?? '',
        account_category: values.account_category ?? '',
        account_type: (values.account_type as 'General' | 'Detail') ?? 'Detail',
        is_contra_account: Boolean(values.is_contra_account),
        level: Number(values.level) || 1,
        header_account_id: values.header_account_id ? Number(values.header_account_id) : null,
        description: values.description ?? null,
        is_active: Boolean(values.is_active ?? true),
    };
}
