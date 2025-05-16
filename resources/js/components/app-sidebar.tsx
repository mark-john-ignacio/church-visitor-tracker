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
    const { navigation } = usePage().props as any;
    const { mainNavItems = [], footerNavItems = [] } = navigation;
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
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
                <NavMain items={mainNavItems} isCollapsed={isCollapsed} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} isCollapsed={isCollapsed} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
