import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useStandardForm } from '@/hooks/use-standard-form';
import { ChartOfAccount, HeaderAccountOption } from '@/types';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { chartOfAccountSchema, normalizeChartOfAccount } from './schema';

interface ChartOfAccountFormProps {
    defaultValues: Partial<ChartOfAccount>;
    url: string;
    method: 'post' | 'put';
    disabled?: boolean;
    headerAccounts: HeaderAccountOption[];
    accountCategories?: string[];
    accountTypes?: string[];
    errors?: Record<string, string>;
    onSuccess?: () => void;
}

// Constants
const ACCOUNT_CATEGORIES = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'COST OF SALES', 'EXPENSES'];
const ACCOUNT_TYPES = ['General', 'Detail'];
const LEVELS = [1, 2, 3, 4, 5];
const NULL_VALUE = '__NULL_VALUE__';

export function ChartOfAccountForm({
    defaultValues,
    url,
    method,
    disabled = false,
    headerAccounts,
    accountCategories = ACCOUNT_CATEGORIES,
    accountTypes = ACCOUNT_TYPES,
    errors = {},
    onSuccess,
}: ChartOfAccountFormProps) {
    const normalizedDefaults = normalizeChartOfAccount(defaultValues);

    const form = useStandardForm({
        schema: chartOfAccountSchema,
        defaultValues: normalizedDefaults,
        url,
        method,
        onSuccess,
        successMessage: {
            create: 'Account created successfully',
            update: 'Account updated successfully',
        },
    });

    const currentLevel = form.watch('level');

    // Auto-clear header_account_id when level is 1
    useEffect(() => {
        if (currentLevel === 1 && form.getValues('header_account_id')) {
            form.setValue('header_account_id', null);
        }
    }, [currentLevel, form]);

    const headerAccountOptions = headerAccounts.map((acc) => ({
        ...acc,
        label: `${acc.account_code} - ${acc.account_name}`,
    }));

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(form.submit)} className="space-y-6">
                {/* Account Code and Name */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="account_code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., 10100" {...field} disabled={disabled} />
                                </FormControl>
                                <FormMessage />
                                {errors.account_code && <FormMessage>{errors.account_code}</FormMessage>}
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="account_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Cash in Bank" {...field} disabled={disabled} />
                                </FormControl>
                                <FormMessage />
                                {errors.account_name && <FormMessage>{errors.account_name}</FormMessage>}
                            </FormItem>
                        )}
                    />
                </div>

                {/* Account Category and Type */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="account_category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account Category</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select account category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {accountCategories.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>Primary classification of the account</FormDescription>
                                <FormMessage />
                                {errors.account_category && <FormMessage>{errors.account_category}</FormMessage>}
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="account_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select account type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {accountTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>General accounts can have sub-accounts</FormDescription>
                                <FormMessage />
                                {errors.account_type && <FormMessage>{errors.account_type}</FormMessage>}
                            </FormItem>
                        )}
                    />
                </div>

                {/* Level and Header Account */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="level"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Level</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(parseInt(value))}
                                    value={field.value?.toString()}
                                    disabled={disabled}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select level" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {LEVELS.map((level) => (
                                            <SelectItem key={level} value={level.toString()}>
                                                Level {level}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>Hierarchy level (1 = top level)</FormDescription>
                                <FormMessage />
                                {errors.level && <FormMessage>{errors.level}</FormMessage>}
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="header_account_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Header Account</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(value === NULL_VALUE ? null : parseInt(value))}
                                    value={field.value?.toString() ?? NULL_VALUE}
                                    disabled={disabled || currentLevel === 1}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={currentLevel === 1 ? 'N/A for Level 1' : 'Select header account'} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value={NULL_VALUE}>
                                            <em>None</em>
                                        </SelectItem>
                                        {headerAccountOptions.map((acc) => (
                                            <SelectItem key={acc.id} value={acc.id.toString()}>
                                                {acc.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>Required for Level 2-5</FormDescription>
                                <FormMessage />
                                {errors.header_account_id && <FormMessage>{errors.header_account_id}</FormMessage>}
                            </FormItem>
                        )}
                    />
                </div>

                {/* Checkboxes */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[
                        {
                            name: 'is_contra_account' as const,
                            label: 'Contra Account',
                            description: 'Reduces the normal balance',
                        },
                        {
                            name: 'is_active' as const,
                            label: 'Active',
                            description: 'Account is currently usable',
                        },
                    ].map(({ name, label, description }) => (
                        <FormField
                            key={name}
                            control={form.control}
                            name={name}
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>{label}</FormLabel>
                                        <FormDescription>{description}</FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                    ))}
                </div>

                {/* Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Optional description for this account"
                                    className="resize-none"
                                    {...field}
                                    value={field.value || ''}
                                    disabled={disabled}
                                    rows={3}
                                />
                            </FormControl>
                            <FormDescription>Additional details (optional)</FormDescription>
                            <FormMessage />
                            {errors.description && <FormMessage>{errors.description}</FormMessage>}
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.get(route('accounting-setup.chart-of-accounts.index'))}
                        disabled={form.isSubmitting || disabled}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={form.isSubmitting || disabled}>
                        {form.isSubmitting ? 'Processing...' : method === 'post' ? 'Create Account' : 'Update Account'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
