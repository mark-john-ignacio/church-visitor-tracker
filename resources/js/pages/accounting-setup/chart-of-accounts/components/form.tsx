import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { HeaderAccountOption } from '@/types'; // Import the new type
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm as useInertiaForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface ChartOfAccountFormProps {
    defaultValues: Partial<ChartOfAccount>; // Use Partial for create form
    url: string;
    method: 'post' | 'put';
    disabled?: boolean;
    headerAccounts: HeaderAccountOption[]; // Pass header accounts for the dropdown
}

const accountTypeOptions = ['Asset', 'Liability', 'Equity', 'Income', 'Expense', 'Other'];
const accountNatureOptions: Array<'General' | 'Detail'> = ['General', 'Detail'];
const levelOptions = [1, 2, 3, 4, 5];

const formSchema = z
    .object({
        account_code: z.string().min(1, 'Account code is required'),
        account_name: z.string().min(1, 'Account name is required'),
        account_type: z.string().min(1, 'Account type is required'),
        account_nature: z.enum(['General', 'Detail'], { required_error: 'Account nature is required' }),
        is_contra_account: z.boolean().default(false),
        level: z.number().min(1).max(5, 'Level must be between 1 and 5'),
        header_account_id: z.number().nullable().optional(),
        description: z.string().nullable().optional(),
        is_active: z.boolean().default(true),
    })
    .refine((data) => !(data.level > 1 && !data.header_account_id), {
        message: 'Header account is required for levels 2-5',
        path: ['header_account_id'], // Path to the field to attach the error
    })
    .refine((data) => !(data.level === 1 && data.header_account_id), {
        message: 'Header account should be empty for level 1',
        path: ['header_account_id'],
    });

const NULL_HEADER_ACCOUNT_VALUE = '__NULL_VALUE__';

export function ChartOfAccountForm({ defaultValues, url, method, disabled = false, headerAccounts }: ChartOfAccountFormProps) {
    const {
        data: inertiaData,
        setData,
        post,
        put,
        processing,
        errors: inertiaErrors,
    } = useInertiaForm({
        account_code: defaultValues.account_code || '',
        account_name: defaultValues.account_name || '',
        account_type: defaultValues.account_type || '',
        account_nature: defaultValues.account_nature || 'Detail',
        is_contra_account: defaultValues.is_contra_account ?? false,
        level: defaultValues.level || 1,
        header_account_id: defaultValues.header_account_id || null,
        description: defaultValues.description || '',
        is_active: defaultValues.is_active ?? true,
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            // Ensure all fields are initialized
            account_code: inertiaData.account_code,
            account_name: inertiaData.account_name,
            account_type: inertiaData.account_type,
            account_nature: inertiaData.account_nature as 'General' | 'Detail',
            is_contra_account: inertiaData.is_contra_account,
            level: inertiaData.level,
            header_account_id: inertiaData.header_account_id,
            description: inertiaData.description,
            is_active: inertiaData.is_active,
        },
    });

    const currentLevel = form.watch('level');

    useEffect(() => {
        // If level is 1, clear header_account_id
        if (currentLevel === 1 && form.getValues('header_account_id') !== null) {
            form.setValue('header_account_id', null);
            setData('header_account_id', null);
        }
    }, [currentLevel, form, setData]);

    useEffect(() => {
        // When defaultValues (from Inertia props) change, reset the form.
        // This ensures that if the user navigates away and back, or if the props update,
        // the form reflects the latest data.
        const newDefaultValues = {
            account_code: defaultValues.account_code || '',
            account_name: defaultValues.account_name || '',
            account_type: defaultValues.account_type || '',
            account_nature: defaultValues.account_nature || 'Detail',
            is_contra_account: defaultValues.is_contra_account ?? false,
            level: defaultValues.level || 1,
            header_account_id: defaultValues.header_account_id || null,
            description: defaultValues.description || '',
            is_active: defaultValues.is_active ?? true,
        };
        form.reset(newDefaultValues as any); // Sync react-hook-form with inertia data
        setData(newDefaultValues as any); // Also sync inertia form data if needed, though form.reset should be primary
    }, [defaultValues]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        const dataToSubmit = { ...values };
        if (dataToSubmit.level === 1) {
            dataToSubmit.header_account_id = null;
        }
        setData(dataToSubmit as any); // Cast to any to match Inertia's useForm data structure

        if (method === 'post') {
            post(url, { onError: (pageErrors) => form.setError('root', { type: 'manual', message: 'Server validation failed.' }) });
        } else {
            put(url, { onError: (pageErrors) => form.setError('root', { type: 'manual', message: 'Server validation failed.' }) });
        }
    }

    const displayHeaderAccounts = headerAccounts.map((acc) => ({
        ...acc,
        label: `${acc.account_code} - ${acc.account_name}`,
        value: acc.id,
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
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select account type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {accountTypeOptions.map((type) => (
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
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select nature" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {accountNatureOptions.map((nature) => (
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
                                    onValueChange={(value) => field.onChange(parseInt(value))} // Ensure value is number
                                    value={field.value?.toString()} // Ensure value is string for Select
                                    disabled={disabled}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select level" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {levelOptions.map((level) => (
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
                                    onValueChange={(value) => {
                                        if (value === NULL_HEADER_ACCOUNT_VALUE) {
                                            field.onChange(null);
                                        } else {
                                            field.onChange(value ? parseInt(value) : null);
                                        }
                                    }}
                                    value={field.value === null || field.value === undefined ? NULL_HEADER_ACCOUNT_VALUE : field.value.toString()}
                                    disabled={disabled || currentLevel === 1}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={currentLevel === 1 ? 'N/A for Level 1' : 'Select header account'} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value={NULL_HEADER_ACCOUNT_VALUE}>
                                            <em>None</em>
                                        </SelectItem>
                                        {displayHeaderAccounts.map((acc) => (
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

                {/* Is Contra and Is Active */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="is_contra_account"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Contra Account</FormLabel>
                                    <FormDescription>Is this a contra account?</FormDescription>
                                </div>
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="is_active"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Active</FormLabel>
                                    <FormDescription>Is this account active?</FormDescription>
                                </div>
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
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
