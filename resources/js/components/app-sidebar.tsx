import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';

export function AppSidebar() {
    // Get navigation items from shared props
    const { navigation, auth } = usePage().props as any;
    const { mainNavItems, footerNavItems } = navigation || { mainNavItems: [], footerNavItems: [] };
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    // console.log('User:', auth?.user);
    // console.log('Permissions:', auth?.permissions);
    // console.log('Navigation:', navigation);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                {/* Conditionally render logo */}
                                {isCollapsed ? (
                                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                                        <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                                    </div>
                                ) : (
                                    <AppLogo />
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Pass isCollapsed to NavMain */}
                <NavMain items={mainNavItems || []} isCollapsed={isCollapsed} />
            </SidebarContent>

            <SidebarFooter>
                {/* Pass isCollapsed to NavFooter and NavUser */}
                <NavFooter items={footerNavItems || []} className="mt-auto" isCollapsed={isCollapsed} />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
