import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import * as LucideIcons from 'lucide-react';
import { type ComponentPropsWithoutRef } from 'react';
import { DynamicIcon } from './dynamic-icon';

interface NavFooterProps extends ComponentPropsWithoutRef<typeof SidebarGroup> {
    items: NavItem[];
    isCollapsed?: boolean;
}

export function NavFooter({ items, isCollapsed = false, className = '', ...props }: NavFooterProps) {
    return (
        <SidebarGroup {...props} className={`group-data-[collapsible=icon]:p-0 ${className}`}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
                                tooltip={isCollapsed ? { children: item.title, side: 'right' } : undefined}
                            >
                                <a href={item.href} target="_blank" rel="noopener noreferrer">
                                    {item.icon && <DynamicIcon name={item.icon as unknown as keyof typeof LucideIcons} />}
                                    <span>{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
