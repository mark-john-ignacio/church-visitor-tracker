import type { Meta, StoryObj } from '@storybook/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { DataTable } from '../resources/js/components/data-table';
import { Badge } from '../resources/js/components/ui/badge';
import { Button } from '../resources/js/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../resources/js/components/ui/dropdown-menu';

// Sample data types
interface SampleMenuItem {
    id: number;
    name: string;
    route: string | null;
    icon: string | null;
    type: 'main' | 'footer' | 'user';
    order: number;
    created_at: string;
}

// Expanded sample data for better demonstration
const sampleMenuItems: SampleMenuItem[] = [
    {
        id: 1,
        name: 'Dashboard',
        route: 'dashboard',
        icon: 'LayoutGrid',
        type: 'main',
        order: 1,
        created_at: '2024-01-15T10:30:00Z',
    },
    {
        id: 2,
        name: 'Users Management',
        route: 'admin.users.index',
        icon: 'Users',
        type: 'main',
        order: 2,
        created_at: '2024-01-15T10:31:00Z',
    },
    {
        id: 3,
        name: 'Chart of Accounts',
        route: 'accounting-setup.chart-of-accounts.index',
        icon: 'Calculator',
        type: 'main',
        order: 3,
        created_at: '2024-01-15T10:32:00Z',
    },
    {
        id: 4,
        name: 'Settings',
        route: 'settings',
        icon: 'Settings',
        type: 'user',
        order: 1,
        created_at: '2024-01-15T10:33:00Z',
    },
    {
        id: 5,
        name: 'Profile',
        route: 'profile.edit',
        icon: 'User',
        type: 'user',
        order: 2,
        created_at: '2024-01-15T10:34:00Z',
    },
    {
        id: 6,
        name: 'Privacy Policy',
        route: 'privacy',
        icon: null,
        type: 'footer',
        order: 1,
        created_at: '2024-01-15T10:35:00Z',
    },
    {
        id: 7,
        name: 'Terms of Service',
        route: 'terms',
        icon: null,
        type: 'footer',
        order: 2,
        created_at: '2024-01-15T10:36:00Z',
    },
    {
        id: 8,
        name: 'Reports',
        route: 'reports.index',
        icon: 'BarChart',
        type: 'main',
        order: 4,
        created_at: '2024-01-15T10:37:00Z',
    },
    {
        id: 9,
        name: 'Help Center',
        route: 'help',
        icon: 'HelpCircle',
        type: 'footer',
        order: 3,
        created_at: '2024-01-15T10:38:00Z',
    },
    {
        id: 10,
        name: 'Banks Setup',
        route: 'accounting-setup.banks.index',
        icon: 'Landmark',
        type: 'main',
        order: 5,
        created_at: '2024-01-15T10:39:00Z',
    },
];

// Enhanced columns with better styling
const sampleColumns: ColumnDef<SampleMenuItem>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="hover:bg-muted/50">
                Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const name = row.getValue('name') as string;
            const icon = row.original.icon;
            return (
                <div className="flex items-center gap-2">
                    {icon && (
                        <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-md">
                            <span className="text-primary text-xs font-medium">{icon.slice(0, 2)}</span>
                        </div>
                    )}
                    <div className="font-medium">{name}</div>
                </div>
            );
        },
    },
    {
        accessorKey: 'route',
        header: 'Route',
        cell: ({ row }) => {
            const route = row.getValue('route') as string;
            return route ? (
                <code className="bg-muted rounded px-2 py-1 font-mono text-sm">{route}</code>
            ) : (
                <span className="text-muted-foreground italic">No route</span>
            );
        },
    },
    {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => {
            const type = row.getValue('type') as string;
            const variants = {
                main: 'default' as const,
                footer: 'outline' as const,
                user: 'secondary' as const,
            };
            return (
                <Badge variant={variants[type as keyof typeof variants]} className="capitalize">
                    {type}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'icon',
        header: 'Icon',
        cell: ({ row }) => {
            const icon = row.getValue('icon') as string;
            return icon ? (
                <Badge variant="outline" className="font-mono text-xs">
                    {icon}
                </Badge>
            ) : (
                <span className="text-muted-foreground">—</span>
            );
        },
    },
    {
        accessorKey: 'order',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="hover:bg-muted/50">
                Order
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const order = row.getValue('order') as number;
            return (
                <div className="text-center">
                    <span className="bg-muted inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium">{order}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Created',
        cell: ({ row }) => {
            const date = new Date(row.getValue('created_at'));
            return (
                <div className="text-sm">
                    <div className="font-medium">{date.toLocaleDateString()}</div>
                    <div className="text-muted-foreground">{date.toLocaleTimeString()}</div>
                </div>
            );
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const item = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit {item.name}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                            Reorder
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete {item.name}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

const meta: Meta<typeof DataTable> = {
    title: 'Components/DataTable',
    component: DataTable,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: `
# DataTable Component

A comprehensive, feature-rich data table component built for Laravel + Inertia.js applications.

## Key Features

- **Server-side capabilities**: Pagination, search, sorting handled by Laravel backend
- **State persistence**: Column visibility preferences saved to localStorage
- **Delete confirmations**: Built-in confirmation dialogs with customizable messages
- **Responsive design**: Mobile-friendly with column hiding capabilities
- **Inertia.js integration**: Seamless state synchronization with Laravel

## Visual Features

- **Enhanced cells**: Rich cell rendering with icons, badges, and formatted data
- **Sortable headers**: Click column headers to sort (with visual indicators)
- **Action menus**: Dropdown menus for row-level actions
- **Type badges**: Color-coded badges for different menu types
- **Responsive layout**: Adapts to different screen sizes

## Usage in Real Application

\`\`\`tsx
// In your Laravel + Inertia page component
export default function NavigationIndex({ navItems, filters }) {
    return (
        <AppLayout>
            <DataTable
                columns={navigationColumns}
                data={navItems.data}
                searchColumn="name"
                searchPlaceholder="Search menu items..."
                serverSide={true}
                pagination={{
                    pageIndex: navItems.current_page - 1,
                    pageSize: navItems.per_page,
                    pageCount: navItems.last_page,
                    total: navItems.total,
                }}
                filters={filters}
                tableKey="navigation-table"
            />
        </AppLayout>
    );
}
\`\`\`
        `,
            },
        },
    },
    argTypes: {
        columns: {
            control: false,
            description: 'Array of TanStack Table column definitions with enhanced styling',
        },
        data: {
            control: false,
            description: 'Array of data objects to display',
        },
        searchPlaceholder: {
            control: 'text',
            description: 'Placeholder text for search input',
        },
        serverSide: {
            control: 'boolean',
            description: 'Enable server-side features (pagination, search, sorting)',
        },
        tableKey: {
            control: 'text',
            description: 'Unique identifier for localStorage preferences',
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        columns: sampleColumns,
        data: sampleMenuItems,
        searchPlaceholder: 'Search menu items...',
        searchColumn: 'name',
        tableKey: 'demo-table',
    },
    parameters: {
        docs: {
            description: {
                story: `
**Default DataTable Example**

This shows the DataTable with all features enabled:
- ✅ Search functionality
- ✅ Column sorting with visual indicators
- ✅ Column visibility controls
- ✅ Enhanced cell rendering
- ✅ Action dropdown menus
- ✅ Responsive design

Try the following interactions:
- **Search**: Type in the search box to filter items
- **Sort**: Click column headers to sort data
- **Columns**: Use the "Columns" dropdown to show/hide columns
- **Actions**: Click the menu button in the Actions column
        `,
            },
        },
    },
};

export const ServerSide: Story = {
    args: {
        columns: sampleColumns,
        data: sampleMenuItems.slice(0, 5), // Show fewer items to simulate pagination
        searchPlaceholder: 'Filter menu items...',
        searchColumn: 'name',
        serverSide: true,
        pagination: {
            pageIndex: 0,
            pageSize: 5,
            pageCount: 2,
            total: 10,
        },
        filters: {
            search: '',
            sort: 'name',
            order: 'asc',
        },
        tableKey: 'server-side-demo',
    },
    parameters: {
        docs: {
            description: {
                story: `
**Server-Side DataTable**

Demonstrates server-side capabilities:
- **Pagination**: Shows "Showing X to Y of Z results"
- **Search**: Would send debounced requests to Laravel (mocked in Storybook)
- **Sorting**: Updates URL parameters (mocked in Storybook)
- **State sync**: Maintains state between page requests

In a real Laravel application, this would:
1. Send AJAX requests via Inertia.js
2. Update URL parameters automatically
3. Maintain browser history
4. Handle loading states
        `,
            },
        },
    },
};

export const ClientSideOnly: Story = {
    args: {
        columns: sampleColumns,
        data: sampleMenuItems,
        searchPlaceholder: 'Search menu items...',
        searchColumn: 'name',
        serverSide: false,
        tableKey: 'client-side-demo',
    },
    parameters: {
        docs: {
            description: {
                story: `
**Client-Side Only DataTable**

Perfect for smaller datasets:
- All data loaded upfront
- Instant search and filtering
- Client-side pagination
- No server requests after initial load

Use this mode when:
- Dataset is small (< 1000 items)
- You want instant interactions
- Server-side processing isn't needed
        `,
            },
        },
    },
};

export const WithDeleteConfirmation: Story = {
    args: {
        columns: sampleColumns,
        data: sampleMenuItems.slice(0, 5),
        searchColumn: 'name',
        getDeleteConfirmationMessage: (item: SampleMenuItem) =>
            `Are you sure you want to delete "${item.name}"? This will remove it from the ${item.type} navigation and may affect user experience.`,
        tableKey: 'delete-demo',
    },
    parameters: {
        docs: {
            description: {
                story: `
**Delete Confirmation System**

- Custom confirmation messages per item
- Contextual information in the message
- Safe deletion workflow
- Prevents accidental deletions

Click the delete action in any row to see the confirmation dialog.
        `,
            },
        },
    },
};

export const ColumnCustomization: Story = {
    args: {
        columns: sampleColumns,
        data: sampleMenuItems,
        tableKey: 'column-demo',
    },
    parameters: {
        docs: {
            description: {
                story: `
**Column Visibility Management**

Features:
- **Columns dropdown**: Show/hide any column
- **Persistent preferences**: Saved to localStorage
- **Reset button**: Restore all columns
- **User customization**: Each user can customize their view

Try hiding/showing different columns and notice how the table adapts.
        `,
            },
        },
    },
};
