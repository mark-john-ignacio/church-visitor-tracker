import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChartOfAccount, HeaderAccountOption } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm as useInertiaForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface ChartOfAccountFormProps {
    defaultValues: Partial<ChartOfAccount>;
    url: string;
    method: 'post' | 'put';
    disabled?: boolean;
    headerAccounts: HeaderAccountOption[];
}

const formSchema = z
    .object({
        account_code: z.string().min(1, 'Account code is required'),
        account_name: z.string().min(1, 'Account name is required'),
        account_type: z.string().min(1, 'Account type is required'),
        account_nature: z.enum(['General', 'Detail'], { required_error: 'Account nature is required' }),
        is_contra_account: z.boolean(),
        level: z.number().min(1).max(5, 'Level must be between 1 and 5'),
        header_account_id: z.number().nullable().optional(),
        description: z.string().nullable().optional(),
        is_active: z.boolean(),
    })
    .refine((data) => data.level === 1 || data.header_account_id, {
        message: 'Header account is required for levels 2-5',
        path: ['header_account_id'],
    })
    .refine((data) => data.level > 1 || !data.header_account_id, {
        message: 'Header account should be empty for level 1',
        path: ['header_account_id'],
    });

// Constants
const ACCOUNT_TYPES = ['Asset', 'Liability', 'Equity', 'Income', 'Expense', 'Other'];
const ACCOUNT_NATURES = ['General', 'Detail'] as const;
const LEVELS = [1, 2, 3, 4, 5];
const NULL_VALUE = '__NULL_VALUE__';

// Helper function to normalize form data
const normalizeFormData = (values: Partial<ChartOfAccount>) => ({
    account_code: values.account_code || '',
    account_name: values.account_name || '',
    account_type: values.account_type || '',
    account_nature: values.account_nature || ('Detail' as const),
    is_contra_account: values.is_contra_account ?? false,
    level: values.level || 1,
    header_account_id: values.header_account_id ?? null,
    description: values.description || '',
    is_active: values.is_active ?? true,
});

export function ChartOfAccountForm({ defaultValues, url, method, disabled = false, headerAccounts }: ChartOfAccountFormProps) {
    const normalizedDefaults = normalizeFormData(defaultValues);

    const { setData, post, put, processing, errors: inertiaErrors } = useInertiaForm(normalizedDefaults);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
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
        const newDefaults = normalizeFormData(defaultValues);
        form.reset(newDefaults);
        setData(newDefaults);
    }, [defaultValues, form, setData]);

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const submitData = {
            ...values,
            header_account_id: values.header_account_id || null,
            description: values.description || '',
        };

        setData(submitData);

        const submitOptions = {
            preserveScroll: true,
            onSuccess: () => console.log('Success'),
            onError: (errors: any) => console.error('Error:', errors),
        };

        method === 'post' ? post(url, submitOptions) : put(url, submitOptions);
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
                                {inertiaErrors.account_code && <FormMessage>{inertiaErrors.account_code}</FormMessage>}
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
                                {inertiaErrors.account_name && <FormMessage>{inertiaErrors.account_name}</FormMessage>}
                            </FormItem>
                        )}
                    />
                </div>

                {/* Account Type and Nature */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                        {ACCOUNT_TYPES.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                {inertiaErrors.account_type && <FormMessage>{inertiaErrors.account_type}</FormMessage>}
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="account_nature"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account Nature</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select nature" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {ACCOUNT_NATURES.map((nature) => (
                                            <SelectItem key={nature} value={nature}>
                                                {nature}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                {inertiaErrors.account_nature && <FormMessage>{inertiaErrors.account_nature}</FormMessage>}
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
                                                {level}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                {inertiaErrors.level && <FormMessage>{inertiaErrors.level}</FormMessage>}
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
                                {inertiaErrors.header_account_id && <FormMessage>{inertiaErrors.header_account_id}</FormMessage>}
                            </FormItem>
                        )}
                    />
                </div>

                {/* Checkboxes */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[
                        { name: 'is_contra_account' as const, label: 'Contra Account', description: 'Is this a contra account?' },
                        { name: 'is_active' as const, label: 'Active', description: 'Is this account active?' },
                    ].map(({ name, label, description }) => (
                        <FormField
                            key={name}
                            control={form.control}
                            name={name}
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">{label}</FormLabel>
                                        <FormDescription>{description}</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
                                    </FormControl>
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
                                    placeholder="Optional description"
                                    className="resize-none"
                                    {...field}
                                    value={field.value || ''}
                                    disabled={disabled}
                                />
                            </FormControl>
                            <FormMessage />
                            {inertiaErrors.description && <FormMessage>{inertiaErrors.description}</FormMessage>}
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button type="submit" disabled={processing || disabled}>
                        {method === 'post' ? 'Create' : 'Update'} Account
                    </Button>
                </div>
            </form>
        </Form>
    );
}
