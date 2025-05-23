import type { Config } from 'ziggy-js';

export interface Company {
    id: string;
    display_name: string;
    name?: string;
    is_active: boolean;
}

export interface Auth {
    user: User;
    permissions?: string[];
    roles?: string[];
    companies?: Company[];
    active_company_id?: string;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: string;
    isActive?: boolean;
    children?: NavItem[];
}

export interface Navigation {
    mainNavItems: NavItem[];
    footerNavItems: NavItem[];
}

export interface SharedData {
    auth: Auth;
    ziggy: Config & { location: string };
    navigation: Navigation;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles?: { name: string }[];
    [key: string]: unknown; // This allows for additional properties...
}

// --- Add PageProps definition ---
export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & SharedData;
// --- End of PageProps definition ---

export interface LaravelPaginator<T> {
    current_page: number;
    data: T[];
    first_page_url: string | null;
    from: number | null;
    last_page: number;
    last_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

export interface ChartOfAccount {
    id: number;
    company_id: string;
    account_code: string;
    account_name: string;
    account_type: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;

    account_nature: 'General' | 'Detail';
    is_contra_account: boolean;
    level: number;
    header_account_id: number | null;
    header_account?: {
        id: number;
        account_code: string;
        account_name: string;
    } | null;
}

export interface HeaderAccountOption {
    id: number;
    account_code: string;
    account_name: string;
    label?: string;
    value?: number;
}

export interface ChartOfAccountCreatePageProps extends PageProps {
    headerAccounts: HeaderAccountOption[];
}

export interface ChartOfAccountEditPageProps extends PageProps {
    account: ChartOfAccount;
    headerAccounts: HeaderAccountOption[];
}
