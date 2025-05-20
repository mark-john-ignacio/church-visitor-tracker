import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Company } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Building } from 'lucide-react';
import { useEffect, useState } from 'react';

export function CompanySwitcher() {
    const { auth } = usePage().props as any;
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const activeCompanyId = auth.active_company_id;

    const { data, setData, post, processing } = useForm({
        company_id: activeCompanyId || '',
    });

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                setLoading(true);
                const response = await axios.get(route('companies.list'));
                setCompanies(response.data.companies || []);

                // Set the active company if not already set
                if (!data.company_id && response.data.companies?.length) {
                    setData('company_id', response.data.active_company_id || response.data.companies[0].id);
                }
            } catch (error) {
                console.error('Failed to fetch companies:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    const handleCompanyChange = (companyId: string) => {
        setData('company_id', companyId);

        // Submit the form to switch companies
        post(route('companies.switch'), {
            preserveScroll: true,
            onSuccess: () => {
                // Reload the page data without changing the URL
                window.location.reload();
            },
        });
    };

    if (loading || companies.length === 0) {
        return null;
    }

    const activeCompany = companies.find((company) => company.is_active) || companies[0];

    return (
        <div className="flex items-center space-x-2 px-3 py-2">
            <Building className="text-muted-foreground h-4 w-4" />
            <Select value={data.company_id} onValueChange={handleCompanyChange} disabled={processing}>
                <SelectTrigger className="h-auto w-auto border-none bg-transparent p-0 shadow-none">
                    <SelectValue placeholder={activeCompany?.display_name || 'Select company'} />
                </SelectTrigger>
                <SelectContent>
                    {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                            {company.display_name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
