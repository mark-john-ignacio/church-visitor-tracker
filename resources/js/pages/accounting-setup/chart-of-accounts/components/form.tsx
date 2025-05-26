import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChartOfAccount, HeaderAccountOption } from '@/types'; // Import the new type
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
        is_contra_account: z.boolean(),
        level: z.number().min(1).max(5, 'Level must be between 1 and 5'),
        header_account_id: z.number().nullable().optional(),
        description: z.string().nullable().optional(),
        is_active: z.boolean(),
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
        header_account_id: defaultValues.header_account_id ?? null,
        description: defaultValues.description || '',
        is_active: defaultValues.is_active ?? true,
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            // Ensure all fields are initialized with correct types
            account_code: inertiaData.account_code,
            account_name: inertiaData.account_name,
            account_type: inertiaData.account_type,
            account_nature: inertiaData.account_nature as 'General' | 'Detail',
            is_contra_account: Boolean(inertiaData.is_contra_account), // Cast to boolean
            level: inertiaData.level,
            header_account_id: inertiaData.header_account_id,
            description: inertiaData.description,
            is_active: Boolean(inertiaData.is_active), // Cast to boolean
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
            header_account_id: defaultValues.header_account_id ?? null,
            description: defaultValues.description || '',
            is_active: defaultValues.is_active ?? true,
        };
        form.reset(newDefaultValues as any); // Sync react-hook-form with inertia data
        setData(newDefaultValues as any); // Also sync inertia form data if needed, though form.reset should be primary
    }, [defaultValues]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log('[FORM_DEBUG] RHF onSubmit raw values:', JSON.stringify(values));

        const transformedValues = {
            ...values,
            header_account_id: values.header_account_id === null || values.header_account_id === undefined ? null : Number(values.header_account_id),
            level: Number(values.level),
            description: values.description || '',
            // Ensure boolean values are actual booleans if they were somehow strings from RHF
            is_active: typeof values.is_active === 'string' ? values.is_active === 'true' : Boolean(values.is_active),
            is_contra_account: typeof values.is_contra_account === 'string' ? values.is_contra_account === 'true' : Boolean(values.is_contra_account),
        };
        console.log('[FORM_DEBUG] Transformed values (to be set in Inertia form):', JSON.stringify(transformedValues));

        // Update Inertia's form state with the transformed values from react-hook-form
        setData(transformedValues);

        if (method === 'post') {
            console.log('[FORM_DEBUG] Preparing to POST (create new COA)');
            post(url, {
                preserveScroll: true,
                onBefore: (visit) => {
                    console.log('[FORM_DEBUG] Inertia `post` onBefore - actual data being sent:', JSON.stringify(visit.data));
                },
                onSuccess: (page) => {
                    console.log('[FORM_DEBUG] Inertia `post` onSuccess:', page);
                    // toast success
                },
                onError: (errorBag) => {
                    console.error('[FORM_DEBUG] Inertia `post` onError:', errorBag);
                    // toast error
                },
                onFinish: () => {
                    console.log('[FORM_DEBUG] Inertia `post` onFinish');
                },
            });
        } else {
            console.log(`[FORM_DEBUG] Preparing to PUT for COA ID: ${defaultValues.id}`);
            put(url, {
                preserveScroll: true,
                onBefore: (visit) => {
                    console.log('[FORM_DEBUG] Inertia `put` onBefore - actual data being sent:', JSON.stringify(visit.data));
                },
                onSuccess: (page) => {
                    console.log('[FORM_DEBUG] Inertia `put` onSuccess:', page);
                    // toast success
                },
                onError: (errorBag) => {
                    console.error('[FORM_DEBUG] Inertia `put` onError:', errorBag);
                    // toast error
                },
                onFinish: () => {
                    console.log('[FORM_DEBUG] Inertia `put` onFinish');
                },
            });
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
