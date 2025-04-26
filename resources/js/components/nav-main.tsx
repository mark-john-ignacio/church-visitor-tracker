import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'; // Import Collapsible
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import * as LucideIcons from 'lucide-react';
import { ChevronRight } from 'lucide-react'; // Icon for dropdown indicator
import { useEffect, useState } from 'react'; // Import useState and useEffect
import { DynamicIcon } from './dynamic-icon';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({}); // State to track open collapsibles

    // Function to check if a child link is active
    const isChildActive = (children: NavItem[] | undefined): boolean => {
        return children?.some((child) => child.href === page.url) ?? false;
    };

    // Function to toggle collapsible state
    const toggleItem = (title: string) => {
        setOpenItems((prev) => ({ ...prev, [title]: !prev[title] }));
    };

    // Determine initial open state based on active child
    useEffect(() => {
        const initialOpenState: Record<string, boolean> = {};
        items.forEach((item) => {
            if (isChildActive(item.children)) {
                initialOpenState[item.title] = true;
            }
        });
        setOpenItems(initialOpenState);
    }, [items, page.url]);

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) =>
                    item.children && item.children.length > 0 ? (
                        // Render Collapsible if item has children
                        <Collapsible
                            key={item.title}
                            open={openItems[item.title] || false}
                            onOpenChange={() => toggleItem(item.title)}
                            className="w-full"
                        >
                            <SidebarMenuItem className="p-0">
                                <CollapsibleTrigger asChild>
                                    {/* Use SidebarMenuButton for the trigger */}
                                    <SidebarMenuButton
                                        variant="default" // Adjust variant as needed
                                        className="w-full justify-between pr-2" // Ensure button fills width
                                        isActive={isChildActive(item.children)} // Highlight if child is active
                                        tooltip={{ children: item.title }}
                                    >
                                        <div className="flex items-center gap-2">
                                            {item.icon && <DynamicIcon name={item.icon as unknown as keyof typeof LucideIcons} className="h-4 w-4" />}
                                            <span>{item.title}</span>
                                        </div>
                                        <ChevronRight
                                            className={`h-4 w-4 transition-transform duration-200 ${openItems[item.title] ? 'rotate-90' : ''}`}
                                        />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                            </SidebarMenuItem>
                            <CollapsibleContent className="pl-6">
                                {' '}
                                {/* Indent child items */}
                                <SidebarMenu className="py-1">
                                    {item.children.map((child) => (
                                        <SidebarMenuItem key={child.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={child.href === page.url}
                                                size="sm" // Smaller size for child items
                                                variant="default"
                                                tooltip={{ children: child.title }}
                                            >
                                                <Link href={child.href} prefetch>
                                                    {/* Optional: Add icon for child items too */}
                                                    {/* {child.icon && <DynamicIcon name={child.icon as keyof typeof LucideIcons} className="h-4 w-4" />} */}
                                                    <span>{child.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </CollapsibleContent>
                        </Collapsible>
                    ) : (
                        // Render regular link if no children
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={item.href === page.url} tooltip={{ children: item.title }}>
                                <Link href={item.href} prefetch>
                                    {item.icon && <DynamicIcon name={item.icon as unknown as keyof typeof LucideIcons} className="h-4 w-4" />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ),
                )}
            </SidebarMenu>
        </SidebarGroup>
    );
}
