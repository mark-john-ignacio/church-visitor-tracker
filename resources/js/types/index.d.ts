import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
    permissions?: string[];
    roles?: string[];
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
