import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type Company } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Building } from 'lucide-react';
import { useEffect, useState, type ComponentPropsWithoutRef } from 'react';

interface CompanySwitcherProps extends ComponentPropsWithoutRef<typeof SidebarGroup> {
    isCollapsed?: boolean;
}

export function CompanySwitcher({ isCollapsed = false, className = '', ...props }: CompanySwitcherProps) {
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

        post(route('companies.switch'), {
            preserveScroll: true,
            onSuccess: () => {
                window.location.reload();
            },
        });
    };

    if (loading || companies.length === 0) {
        return null;
    }

    const activeCompany = companies.find((company) => company.is_active) || companies[0];

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
                                {!isCollapsed && (
                                    <Select value={data.company_id} onValueChange={handleCompanyChange} disabled={processing}>
                                        <SelectTrigger className="h-auto w-full border-none bg-transparent p-0 shadow-none">
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
                                )}
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
