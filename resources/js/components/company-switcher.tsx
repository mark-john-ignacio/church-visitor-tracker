import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton'; // Make sure you have this component
import { useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Building } from 'lucide-react';
import { useEffect, useState, type ComponentPropsWithoutRef } from 'react';

interface Company {
    id: string;
    display_name: string;
    is_active: boolean;
}

interface CompanySwitcherProps extends ComponentPropsWithoutRef<typeof SidebarGroup> {
    isCollapsed?: boolean;
}

export function CompanySwitcher({ isCollapsed = false, className = '', ...props }: CompanySwitcherProps) {
    const { auth } = usePage().props as any;
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const activeCompanyId = auth.active_company_id;

    const { data, setData, processing } = useForm({
        company_id: activeCompanyId || '',
    });

    // Set initial company ID when auth.active_company_id changes
    useEffect(() => {
        if (activeCompanyId && (!data.company_id || data.company_id !== activeCompanyId)) {
            setData('company_id', activeCompanyId);
        }
    }, [activeCompanyId]);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                setLoading(true);
                const response = await axios.get(route('companies.list'));

                if (response.data && response.data.companies) {
                    setCompanies(response.data.companies);

                    // Set active company if needed
                    if (response.data.active_company_id && (!data.company_id || data.company_id !== response.data.active_company_id)) {
                        setData('company_id', response.data.active_company_id);
                    } else if (!data.company_id && response.data.companies.length > 0) {
                        setData('company_id', response.data.companies[0].id);
                    }
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
        if (companyId === data.company_id) return;

        setData('company_id', companyId);

        // Use axios directly instead of Inertia post for this action
        axios
            .post(route('companies.switch'), { company_id: companyId })
            .then((response) => {
                window.location.reload();
            })
            .catch((error) => {
                console.error('Error switching company:', error);
            });
    };

    // Find active company when available
    const activeCompany =
        !loading && companies.length > 0 ? companies.find((company) => company.id === data.company_id || company.is_active) || companies[0] : null;

    return (
        <SidebarGroup {...props} className={`group-data-[collapsible=icon]:p-0 ${className}`}>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
                            tooltip={isCollapsed ? { children: 'Switch Company', side: 'right' } : undefined}
                        >
                            <div className="flex w-full items-center">
                                <Building className="mr-2 h-4 w-4" />
                                {!isCollapsed &&
                                    (loading ? (
                                        // Show placeholder during loading to prevent layout shift
                                        <div className="w-full">
                                            <Skeleton className="h-6 w-24" />
                                        </div>
                                    ) : (
                                        <Select value={data.company_id} onValueChange={handleCompanyChange} disabled={processing}>
                                            <SelectTrigger className="h-auto w-full border-none bg-transparent p-0 shadow-none">
                                                <SelectValue placeholder="Select company" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {companies.map((company) => (
                                                    <SelectItem key={company.id} value={company.id}>
                                                        {company.display_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ))}
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
