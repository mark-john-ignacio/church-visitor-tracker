import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import * as LucideIcons from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DynamicIcon } from './dynamic-icon';

export function NavMain({ items = [], isCollapsed = false }: { items: NavItem[]; isCollapsed?: boolean }) {
    const page = usePage();
    const isMobile = useIsMobile();
    const collapsedNav = isCollapsed && !isMobile;

    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

    const isItemActive = (item: NavItem): boolean => {
        if (!item.href) return false;

        // Get pathnames only (ignore query params)
        const currentPath = new URL(page.url, window.location.origin).pathname;
        const itemPath = new URL(item.href, window.location.origin).pathname;

        // Make sure itemPath ends with a slash for strict prefix matching
        const normalizedItemPath = itemPath.endsWith('/') ? itemPath : itemPath + '/';
        const normalizedCurrentPath = currentPath.endsWith('/') ? currentPath : currentPath + '/';

        // Active if current path starts with item path (for subpages)
        if (
            normalizedCurrentPath.startsWith(normalizedItemPath) ||
            normalizedCurrentPath === normalizedItemPath // for exact match
        ) {
            return true;
        }

        // Check children recursively
        if (item.children?.some((child) => isItemActive(child))) return true;

        return false;
    };
    useEffect(() => {
        const stateMap: Record<string, boolean> = {};
        const checkAndSetOpenState = (menuItems: NavItem[], parentPath: string = '') => {
            menuItems.forEach((item) => {
                const itemPath = `${parentPath}${parentPath ? '>' : ''}${item.title}`;

                if (!isCollapsed && isItemActive(item)) {
                    if (parentPath) {
                        parentPath.split('>').reduce((path, segment) => {
                            const currentPath = path ? `${path}>${segment}` : segment;
                            stateMap[currentPath] = true;
                            return currentPath;
                        }, '');
                    }
                    stateMap[itemPath] = true;
                }

                if (item.children?.length) {
                    checkAndSetOpenState(item.children, itemPath);
                }
            });
        };
        checkAndSetOpenState(items);
        setOpenItems(stateMap);
    }, [items, page.url, collapsedNav]);

    const toggleItem = (path: string) => {
        setOpenItems((prev) => ({ ...prev, [path]: !prev[path] }));
    };
    // Recursive function to render menu items with nested children
    const renderMenuItem = (item: NavItem, path: string = '', level: number = 0) => {
        const itemPath = `${path}${path ? '>' : ''}${item.title}`;
        const hasChildren = (item.children?.length ?? 0) > 0;
        const isActive = isItemActive(item);

        // If collapsed and has children, render as dropdown
        if (collapsedNav && hasChildren) {
            return renderCollapsedNestedDropdown(item, level);
        }

        // If has children, render as collapsible
        if (hasChildren) {
            return (
                <Collapsible key={itemPath} open={openItems[itemPath] || false} onOpenChange={() => toggleItem(itemPath)} className="w-full">
                    <SidebarMenuItem className="p-0">
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                                variant="default"
                                className={`w-full justify-between pr-2 ${level > 0 ? 'pl-' + level * 2 : ''}`}
                                isActive={isActive}
                                tooltip={{ children: item.title }}
                            >
                                <div className="flex flex-1 items-center gap-2 overflow-hidden">
                                    <DynamicIcon name={item.icon as unknown as keyof typeof LucideIcons} className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate whitespace-nowrap">{item.title}</span>
                                </div>
                                <ChevronRight
                                    className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${openItems[itemPath] ? 'rotate-90' : ''}`}
                                />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                    </SidebarMenuItem>
                    <CollapsibleContent className={`pl-${level > 0 ? 4 : 6}`}>
                        <SidebarMenuSub className="py-1">{item.children!.map((child) => renderMenuItem(child, itemPath, level + 1))}</SidebarMenuSub>
                    </CollapsibleContent>
                </Collapsible>
            );
        }

        // Render leaf menu item (no children)
        return (
            <SidebarMenuItem key={itemPath}>
                {item.href ? (
                    <SidebarMenuButton
                        asChild
                        isActive={isItemActive(item)}
                        tooltip={{ children: item.title, side: 'right' }}
                        size={level > 0 ? 'sm' : 'default'}
                        className={level > 0 ? `pl-${level}` : ''}
                    >
                        <Link href={item.href} prefetch className="flex flex-1 items-center gap-2 overflow-hidden">
                            <DynamicIcon name={item.icon as unknown as keyof typeof LucideIcons} className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate whitespace-nowrap">{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                ) : (
                    // Render a button instead of a link when there's no href
                    <SidebarMenuButton
                        variant="default"
                        isActive={isActive}
                        tooltip={{ children: item.title, side: 'right' }}
                        size={level > 0 ? 'sm' : 'default'}
                        className={level > 0 ? `pl-${level}` : ''}
                    >
                        <div className="flex flex-1 items-center gap-2 overflow-hidden">
                            <DynamicIcon name={item.icon as unknown as keyof typeof LucideIcons} className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate whitespace-nowrap">{item.title}</span>
                        </div>
                    </SidebarMenuButton>
                )}
            </SidebarMenuItem>
        );
    };

    // Specialized function to render collapsed nested dropdown menus
    const renderCollapsedNestedDropdown = (item: NavItem, level: number = 0) => {
        const hasGrandchildren = item.children?.some((child) => child.children?.length);

        if (level === 0) {
            // Top level dropdown when collapsed
            return (
                <DropdownMenu key={item.title}>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuItem className="p-0">
                            <SidebarMenuButton
                                variant="default"
                                className="w-full justify-center"
                                isActive={isItemActive(item)}
                                tooltip={{ children: item.title, side: 'right' }}
                            >
                                <DynamicIcon name={item.icon as unknown as keyof typeof LucideIcons} className="h-5 w-5" />
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" className="ml-1 max-h-[calc(100vh-4rem)] overflow-auto">
                        <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {item.children!.map((child) => {
                                // If child has children, render as nested dropdown
                                if (child.children?.length) {
                                    return (
                                        <DropdownMenuSub key={child.title}>
                                            <DropdownMenuSubTrigger className="flex items-center gap-2">
                                                <DynamicIcon name={child.icon as unknown as keyof typeof LucideIcons} className="h-4 w-4" />
                                                <span>{child.title}</span>
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent className="max-h-[calc(100vh-8rem)] overflow-auto">
                                                {child.children.map((grandchild) => (
                                                    <DropdownMenuItem
                                                        key={grandchild.title}
                                                        asChild
                                                        className={page.url === grandchild.href ? 'bg-accent' : ''}
                                                    >
                                                        <Link href={grandchild.href} className="flex w-full items-center gap-2">
                                                            <DynamicIcon
                                                                name={grandchild.icon as unknown as keyof typeof LucideIcons}
                                                                className="h-4 w-4"
                                                            />
                                                            <span>{grandchild.title}</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                    );
                                }

                                // Regular dropdown menu item
                                return (
                                    <DropdownMenuItem key={child.title} asChild={!!child.href} className={isItemActive(child) ? 'bg-accent' : ''}>
                                        {child.href ? (
                                            <Link href={child.href} className="flex w-full items-center gap-2">
                                                <DynamicIcon name={child.icon as unknown as keyof typeof LucideIcons} className="h-4 w-4" />
                                                <span>{child.title}</span>
                                            </Link>
                                        ) : (
                                            // Render without Link for items without href
                                            <div className="flex w-full items-center gap-2">
                                                <DynamicIcon name={child.icon as unknown as keyof typeof LucideIcons} className="h-4 w-4" />
                                                <span>{child.title}</span>
                                            </div>
                                        )}
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }

        // This handles deeper nesting if needed
        return null;
    };

    return (
        <SidebarGroup className="px-2 py-0">
            {!isCollapsed && <SidebarGroupLabel>Platform</SidebarGroupLabel>}
            <SidebarMenu>{items.map((item) => renderMenuItem(item))}</SidebarMenu>
        </SidebarGroup>
    );
}
