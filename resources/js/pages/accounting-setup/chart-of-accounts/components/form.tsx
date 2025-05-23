import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm as useInertiaForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface ChartOfAccountFormProps {
    defaultValues: {
        account_code: string;
        account_name: string;
        account_type: string;
        description: string | null;
        is_active: boolean;
    };
    url: string;
    method: 'post' | 'put';
    disabled?: boolean;
}

const accountTypeOptions = ['Asset', 'Liability', 'Equity', 'Income', 'Expense', 'Other'];

const formSchema = z.object({
    account_code: z.string().min(1, 'Account code is required'),
    account_name: z.string().min(1, 'Account name is required'),
    account_type: z.string().min(1, 'Account type is required'),
    description: z.string().nullable().optional(),
    is_active: z.boolean(),
});

export function ChartOfAccountForm({ defaultValues, url, method, disabled = false }: ChartOfAccountFormProps) {
    const { data, setData, post, put, processing, errors } = useInertiaForm({
        account_code: defaultValues.account_code || '',
        account_name: defaultValues.account_name || '',
        account_type: defaultValues.account_type || '',
        description: defaultValues.description || '',
        is_active: defaultValues.is_active ?? true,
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            account_code: data.account_code,
            account_name: data.account_name,
            account_type: data.account_type,
            description: data.description,
            is_active: data.is_active,
        },
    });

    useEffect(() => {
        form.reset({
            account_code: data.account_code,
            account_name: data.account_name,
            account_type: data.account_type,
            description: data.description,
            is_active: data.is_active,
        });
    }, [data, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        setData({
            account_code: values.account_code,
            account_name: values.account_name,
            account_type: values.account_type,
            description: values.description || '',
            is_active: values.is_active,
        });

        if (method === 'post') {
            post(url);
        } else {
            put(url);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="account_code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account Code</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter account code"
                                        {...field}
                                        disabled={disabled}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            setData('account_code', e.target.value);
                                        }}
                                    />
                                </FormControl>
                                {errors.account_code && <FormMessage>{errors.account_code}</FormMessage>}
                                {form.formState.errors.account_code && <FormMessage>{form.formState.errors.account_code.message}</FormMessage>}
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
                                    <Input
                                        placeholder="Enter account name"
                                        {...field}
                                        disabled={disabled}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            setData('account_name', e.target.value);
                                        }}
                                    />
                                </FormControl>
                                {errors.account_name && <FormMessage>{errors.account_name}</FormMessage>}
                                {form.formState.errors.account_name && <FormMessage>{form.formState.errors.account_name.message}</FormMessage>}
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="account_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account Type</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        setData('account_type', value);
                                    }}
                                    value={field.value}
                                    disabled={disabled}
                                >
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
                                {errors.account_type && <FormMessage>{errors.account_type}</FormMessage>}
                                {form.formState.errors.account_type && <FormMessage>{form.formState.errors.account_type.message}</FormMessage>}
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="is_active"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={(checked) => {
                                            const boolValue = checked === true;
                                            field.onChange(boolValue);
                                            setData('is_active', boolValue);
                                        }}
                                        disabled={disabled}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Active</FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter description"
                                    className="resize-none"
                                    {...field}
                                    disabled={disabled}
                                    value={field.value || ''}
                                    onChange={(e) => {
                                        field.onChange(e);
                                        setData('description', e.target.value);
                                    }}
                                />
                            </FormControl>
                            {errors.description && <FormMessage>{errors.description}</FormMessage>}
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
