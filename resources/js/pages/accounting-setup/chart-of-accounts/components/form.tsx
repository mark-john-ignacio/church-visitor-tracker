import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChartOfAccount, HeaderAccountOption } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { chartOfAccountSchema, type FormData, normalizeChartOfAccount } from './schema';

interface ChartOfAccountFormProps {
    defaultValues: Partial<ChartOfAccount>;
    url: string;
    method: 'post' | 'put';
    disabled?: boolean;
    headerAccounts: HeaderAccountOption[];
    accountCategories?: string[];
    accountTypes?: string[];
    errors?: Record<string, string>;
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
}: ChartOfAccountFormProps) {
    const normalizedDefaults = normalizeChartOfAccount(defaultValues);
    const [processing, setProcessing] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(chartOfAccountSchema),
        defaultValues: normalizedDefaults,
    });

    const currentLevel = form.watch('level');

    // Auto-clear header_account_id when level is 1
    useEffect(() => {
        if (currentLevel === 1 && form.getValues('header_account_id')) {
            form.setValue('header_account_id', null);
        }
    }, [currentLevel, form]);

    // Reset form when defaultValues change
    useEffect(() => {
        const newDefaults = normalizeChartOfAccount(defaultValues);
        form.reset(newDefaults);
    }, [defaultValues, form]);

    const onSubmit = (values: FormData) => {
        const submitData = {
            account_code: values.account_code,
            account_name: values.account_name,
            account_category: values.account_category,
            account_type: values.account_type,
            is_contra_account: Boolean(values.is_contra_account),
            level: Number(values.level),
            header_account_id: values.header_account_id ? Number(values.header_account_id) : null,
            description: values.description || '',
            is_active: Boolean(values.is_active),
        };

        console.log('Final submit data:', submitData);

        setProcessing(true);

        const submitOptions = {
            preserveScroll: true,
            onSuccess: () => {
                console.log('Success');
                setProcessing(false);
            },
            onError: (errors: any) => {
                console.error('Error:', errors);
                setProcessing(false);
            },
            onFinish: () => {
                setProcessing(false);
            },
        };

        if (method === 'post') {
            router.post(url, submitData, submitOptions);
        } else {
            router.put(url, submitData, submitOptions);
        }
    };

    const headerAccountOptions = headerAccounts.map((acc) => ({
        ...acc,
        label: `${acc.account_code} - ${acc.account_name}`,
    }));

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                <FormDescription>Primary classification of the account (Asset, Liability, etc.)</FormDescription>
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
                                <FormDescription>General accounts can have sub-accounts, Detail accounts cannot</FormDescription>
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
                                <FormDescription>Hierarchy level (1 = top level, 5 = deepest)</FormDescription>
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
                                <FormDescription>Required if Level is 2-5. Should be empty for Level 1.</FormDescription>
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
                            description: 'Is this a contra account (reduces the normal balance)?',
                        },
                        { name: 'is_active' as const, label: 'Active', description: 'Is this account currently active and usable?' },
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
                            <FormDescription>Additional details about this account (optional)</FormDescription>
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
                        disabled={processing || disabled}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={processing || disabled}>
                        {processing ? 'Processing...' : method === 'post' ? 'Create Account' : 'Update Account'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
