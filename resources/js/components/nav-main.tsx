// filepath: c:\Users\Mark\Herd\myxfin-react-laravel\resources\js\components\nav-main.tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; // Import Dropdown components
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import * as LucideIcons from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DynamicIcon } from './dynamic-icon';

// Assume isCollapsed prop is passed down from AppSidebar
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
            if (!isCollapsed && isChildActive(item.children)) {
                // Only auto-open if not collapsed
                initialOpenState[item.title] = true;
            }
        });
        setOpenItems(initialOpenState);
    }, [items, page.url, isCollapsed]); // Add isCollapsed dependency

    return (
        <SidebarGroup className="px-2 py-0">
            {!isCollapsed && <SidebarGroupLabel>Platform</SidebarGroupLabel>}
            <SidebarMenu>
                {items.map((item) => {
                    const hasChildren = item.children && item.children.length > 0;

                    if (hasChildren) {
                        if (isCollapsed) {
                            // --- Render DropdownMenu for collapsed state ---
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
                                                {/* Parent Icon Only */}
                                                {item.icon && <DynamicIcon name={item.icon as keyof typeof LucideIcons} className="h-5 w-5" />}
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="right" align="start" className="ml-1">
                                        <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {item.children!.map((child) => (
                                            <DropdownMenuItem key={child.title} asChild className={page.url === child.href ? 'bg-accent' : ''}>
                                                {/* Link with Child Icon and Text */}
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
                                    onOpenChange={() => toggleItem(item.title)}
                                    className="w-full"
                                >
                                    <SidebarMenuItem className="p-0">
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                variant="default"
                                                className="w-full justify-between pr-2" // Keep existing classes
                                                isActive={isChildActive(item.children)}
                                                tooltip={{ children: item.title }} // Tooltip still useful for long text
                                            >
                                                {/* Use flex container to manage layout */}
                                                <div className="flex flex-1 items-center gap-2 overflow-hidden">
                                                    {' '}
                                                    {/* Added flex-1 and overflow-hidden */}
                                                    {item.icon && (
                                                        <DynamicIcon name={item.icon as keyof typeof LucideIcons} className="h-4 w-4 flex-shrink-0" />
                                                    )}{' '}
                                                    {/* Added flex-shrink-0 */}
                                                    {/* Ensure span is visible and truncates if needed */}
                                                    <span className="truncate whitespace-nowrap">
                                                        {' '}
                                                        {/* Added truncate and whitespace-nowrap */}
                                                        {item.title}
                                                    </span>
                                                </div>
                                                <ChevronRight
                                                    className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${openItems[item.title] ? 'rotate-90' : ''}`}
                                                />{' '}
                                                {/* Added flex-shrink-0 */}
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                    </SidebarMenuItem>
                                    <CollapsibleContent className="pl-6">
                                        {/* ... (CollapsibleContent implementation - unchanged) ... */}
                                    </CollapsibleContent>
                                </Collapsible>
                            );
                        }
                    } else {
                        // --- Render simple link (handles collapsed state via SidebarMenuButton tooltip) ---
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild isActive={item.href === page.url} tooltip={{ children: item.title, side: 'right' }}>
                                    <Link href={item.href} prefetch className="flex flex-1 items-center gap-2 overflow-hidden">
                                        {' '}
                                        {/* Added flex-1 and overflow-hidden */}
                                        {item.icon && (
                                            <DynamicIcon name={item.icon as keyof typeof LucideIcons} className="h-4 w-4 flex-shrink-0" />
                                        )}{' '}
                                        {/* Added flex-shrink-0 */}
                                        <span className="truncate whitespace-nowrap">
                                            {' '}
                                            {/* Added truncate and whitespace-nowrap */}
                                            {item.title}
                                        </span>
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
