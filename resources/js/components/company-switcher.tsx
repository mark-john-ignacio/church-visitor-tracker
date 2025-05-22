import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Building, ChevronDown } from 'lucide-react';
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

    // Find active company
    const activeCompany = !loading && companies.length > 0 ? companies.find((company) => company.id === data.company_id) || companies[0] : null;

    return (
        <SidebarGroup {...props} className={`group-data-[collapsible=icon]:p-0 ${className}`}>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        {isCollapsed ? (
                            // Collapsed state - show just the icon with tooltip
                            <SidebarMenuButton
                                className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
                                tooltip={{ children: 'Switch Company', side: 'right' }}
                            >
                                <Building className="h-4 w-4" />
                            </SidebarMenuButton>
                        ) : (
                            // Expanded state - show dropdown menu
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild disabled={loading || processing}>
                                    <SidebarMenuButton className="w-full justify-start text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100">
                                        <Building className="mr-2 h-4 w-4" />
                                        {loading ? (
                                            <Skeleton className="h-6 w-24" />
                                        ) : (
                                            <>
                                                <span className="truncate">{activeCompany?.display_name || 'Select Company'}</span>
                                                <ChevronDown className="ml-auto h-4 w-4" />
                                            </>
                                        )}
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[--radix-popper-anchor-width]" align="start">
                                    {companies.map((company) => (
                                        <DropdownMenuItem
                                            key={company.id}
                                            onClick={() => handleCompanyChange(company.id)}
                                            className={company.id === data.company_id ? 'bg-accent' : ''}
                                        >
                                            <span>{company.display_name}</span>
                                            {company.id === data.company_id && <span className="text-muted-foreground ml-auto text-xs">Active</span>}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
