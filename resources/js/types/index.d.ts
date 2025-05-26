import { type LucideProps } from 'lucide-react';
import { type ComponentType } from 'react';
import type { Config } from 'ziggy-js';

// ===== CORE SHARED TYPES =====
export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & SharedData;

export interface SharedData {
    auth: {
        user: User;
    };
    name: string;
    quote?: {
        message: string;
        author: string;
    };
    ziggy: Config & { location: string };
    navigation: Navigation;
    sidebarOpen: boolean;
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
    errors?: Record<string, string>;
    [key: string]: unknown;
}

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

// ===== AUTH & USER TYPES =====
export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles?: Array<{ name: string; [key: string]: any }>;
}

export interface Auth {
    user: User;
    permissions?: string[];
    roles?: string[];
    companies?: Company[];
    active_company_id?: string;
}

export interface Company {
    id: string;
    display_name: string;
    name?: string;
    is_active: boolean;
}

// ===== NAVIGATION TYPES =====
export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavItem {
    title: string;
    href: string;
    icon?: ComponentType<LucideProps>;
    isActive?: boolean;
    children?: NavItem[];
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface Navigation {
    mainNavItems: NavItem[];
    footerNavItems: NavItem[];
}

// ===== CHART OF ACCOUNTS TYPES =====
export interface ChartOfAccount {
    id: number;
    company_id: string;
    account_code: string;
    account_name: string;
    account_type: string;
    account_nature: 'General' | 'Detail';
    is_contra_account: boolean;
    level: number;
    header_account_id: number | null;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
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

export interface ChartOfAccountFormProps {
    defaultValues: Partial<ChartOfAccount>;
    url: string;
    method: 'post' | 'put';
    disabled?: boolean;
    headerAccounts: HeaderAccountOption[];
    errors?: Record<string, string>;
}

// ===== FUTURE: ADD MORE MODULES HERE =====
// When you add more features, group them like:
// ===== INVOICING TYPES =====
// ===== INVENTORY TYPES =====
// ===== REPORTING TYPES =====
