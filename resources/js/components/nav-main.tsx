import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import * as LucideIcons from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DynamicIcon } from './dynamic-icon';

export function NavMain({ items = [], isCollapsed = false }: { items: NavItem[]; isCollapsed?: boolean }) {
    const page = usePage();
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

    const isChildActive = (children: NavItem[] | undefined): boolean => {
        return children?.some((child) => child.href === page.url) ?? false;
    };

    const toggleItem = (title: string) => {
        setOpenItems((prev) => ({ ...prev, [title]: !prev[title] }));
    };

    useEffect(() => {
        const initialOpenState: Record<string, boolean> = {};
        items.forEach((item) => {
            // Auto-open if a child is active AND the sidebar is not collapsed
            if (!isCollapsed && isChildActive(item.children)) {
                initialOpenState[item.title] = true;
            }
        });
        setOpenItems(initialOpenState);
    }, [items, page.url, isCollapsed]);

    return (
        <SidebarGroup className="px-2 py-0">
            {!isCollapsed && <SidebarGroupLabel>Platform</SidebarGroupLabel>}
            <SidebarMenu>
                {items.map((item) => {
                    const hasChildren = item.children && item.children.length > 0;

                    if (hasChildren) {
                        if (isCollapsed) {
                            // --- Render DropdownMenu for collapsed state ---
                            // ... (DropdownMenu implementation - should be correct) ...
                            return (
                                <DropdownMenu key={item.title}>
                                    <DropdownMenuTrigger asChild>
                                        <SidebarMenuItem className="p-0">
                                            <SidebarMenuButton
                                                variant="default"
                                                className="w-full justify-center"
                                                isActive={isChildActive(item.children)}
                                                tooltip={{ children: item.title, side: 'right' }}
                                            >
                                                {item.icon && <DynamicIcon name={item.icon as keyof typeof LucideIcons} className="h-5 w-5" />}
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="right" align="start" className="ml-1">
                                        <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {item.children!.map((child) => (
                                            <DropdownMenuItem key={child.title} asChild className={page.url === child.href ? 'bg-accent' : ''}>
                                                <Link href={child.href} className="flex w-full items-center gap-2">
                                                    {child.icon && <DynamicIcon name={child.icon as keyof typeof LucideIcons} className="h-4 w-4" />}
                                                    <span>{child.title}</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            );
                        } else {
                            // --- Render Collapsible for expanded state ---
                            return (
                                <Collapsible
                                    key={item.title}
                                    open={openItems[item.title] || false}
                                    onOpenChange={() => toggleItem(item.title)} // Use the state toggle function
                                    className="w-full"
                                >
                                    <SidebarMenuItem className="p-0">
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                variant="default"
                                                className="w-full justify-between pr-2"
                                                isActive={isChildActive(item.children)}
                                                tooltip={{ children: item.title }}
                                            >
                                                <div className="flex flex-1 items-center gap-2 overflow-hidden">
                                                    {item.icon && (
                                                        <DynamicIcon name={item.icon as keyof typeof LucideIcons} className="h-4 w-4 flex-shrink-0" />
                                                    )}
                                                    <span className="truncate whitespace-nowrap">{item.title}</span>
                                                </div>
                                                <ChevronRight
                                                    className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${openItems[item.title] ? 'rotate-90' : ''}`}
                                                />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                    </SidebarMenuItem>
                                    {/* **** Add this content back **** */}
                                    <CollapsibleContent className="pl-6">
                                        <SidebarMenu className="py-1">
                                            {item.children!.map((child) => (
                                                <SidebarMenuItem key={child.title}>
                                                    <SidebarMenuButton
                                                        asChild
                                                        isActive={child.href === page.url}
                                                        size="sm"
                                                        variant="default"
                                                        tooltip={{ children: child.title }}
                                                    >
                                                        <Link href={child.href} prefetch className="flex items-center gap-2">
                                                            {child.icon && (
                                                                <DynamicIcon name={child.icon as keyof typeof LucideIcons} className="h-4 w-4" />
                                                            )}
                                                            <span>{child.title}</span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                        </SidebarMenu>
                                    </CollapsibleContent>
                                    {/* **** End of added content **** */}
                                </Collapsible>
                            );
                        }
                    } else {
                        // --- Render simple link ---
                        // ... (Simple link implementation - should be correct) ...
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild isActive={item.href === page.url} tooltip={{ children: item.title, side: 'right' }}>
                                    <Link href={item.href} prefetch className="flex flex-1 items-center gap-2 overflow-hidden">
                                        {item.icon && <DynamicIcon name={item.icon as keyof typeof LucideIcons} className="h-4 w-4 flex-shrink-0" />}
                                        <span className="truncate whitespace-nowrap">{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    }
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
