import type { Meta, StoryObj } from '@storybook/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { DataTable } from '../resources/js/components/data-table';
import { Badge } from '../resources/js/components/ui/badge';
import { Button } from '../resources/js/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../resources/js/components/ui/dropdown-menu';

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

// Sample data
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
        name: 'Users',
        route: 'admin.users.index',
        icon: 'Users',
        type: 'main',
        order: 2,
        created_at: '2024-01-15T10:31:00Z',
    },
    {
        id: 3,
        name: 'Settings',
        route: 'settings',
        icon: 'Settings',
        type: 'user',
        order: 1,
        created_at: '2024-01-15T10:32:00Z',
    },
    {
        id: 4,
        name: 'Privacy Policy',
        route: 'privacy',
        icon: null,
        type: 'footer',
        order: 1,
        created_at: '2024-01-15T10:33:00Z',
    },
    {
        id: 5,
        name: 'Terms of Service',
        route: 'terms',
        icon: null,
        type: 'footer',
        order: 2,
        created_at: '2024-01-15T10:34:00Z',
    },
];

// Sample columns
const sampleColumns: ColumnDef<SampleMenuItem>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
    },
    {
        accessorKey: 'route',
        header: 'Route',
        cell: ({ row }) => {
            const route = row.getValue('route') as string;
            return route || <span className="text-muted-foreground">—</span>;
        },
    },
    {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => {
            const type = row.getValue('type') as string;
            const variant = type === 'main' ? 'default' : type === 'footer' ? 'outline' : 'secondary';
            return <Badge variant={variant}>{type}</Badge>;
        },
    },
    {
        accessorKey: 'icon',
        header: 'Icon',
        cell: ({ row }) => {
            const icon = row.getValue('icon') as string;
            return icon ? <Badge variant="outline">{icon}</Badge> : <span className="text-muted-foreground">—</span>;
        },
    },
    {
        accessorKey: 'order',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Order
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const order = row.getValue('order') as number;
            return <div className="text-center">{order}</div>;
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Created',
        cell: ({ row }) => {
            const date = new Date(row.getValue('created_at'));
            return date.toLocaleDateString();
        },
    },
    {
        id: 'actions',
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
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit {item.name}</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete {item.name}</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

const meta: Meta<typeof DataTable> = {
    title: 'Components/DataTable',
    component: DataTable,
    parameters: {
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

## Architecture

The DataTable component works with this flow:
1. **User interaction** (search, sort, paginate) → Updates URL parameters
2. **Inertia.js** sends request to Laravel controller
3. **Laravel controller** processes filters and returns paginated data
4. **DataTable** re-renders with new data

## Server-Side Integration

Works perfectly with this Laravel controller pattern:

\`\`\`php
public function index(Request $request): Response
{
    $items = MenuItem::with('parent')
        ->search($request->search)
        ->when($request->sort, fn($q) => $q->orderBy($request->sort, $request->order ?? 'asc'))
        ->paginate(15)
        ->withQueryString();
    
    return Inertia::render('admin/navigation/index', [
        'items' => $items,
        'filters' => $request->only(['search', 'sort', 'order']),
    ]);
}
\`\`\`

## TypeScript Integration

Use with proper TypeScript interfaces:

\`\`\`tsx
interface MenuItem {
    id: number;
    name: string;
    route: string | null;
    type: 'main' | 'footer' | 'user';
    // ... other properties
}

const columns: ColumnDef<MenuItem>[] = [
    // ... column definitions
];

<DataTable<MenuItem, any>
    columns={columns}
    data={menuItems.data}
    serverSide={true}
/>
\`\`\`
        `,
            },
        },
    },
    argTypes: {
        columns: {
            control: false,
            description: 'Array of TanStack Table column definitions',
        },
        data: {
            control: false,
            description: 'Array of data objects to display',
        },
        searchPlaceholder: {
            control: 'text',
            description: 'Placeholder text for search input',
        },
        searchColumn: {
            control: 'text',
            description: 'Column key to search (for client-side search)',
        },
        serverSide: {
            control: 'boolean',
            description: 'Enable server-side features (pagination, search, sorting)',
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicClientSide: Story = {
    args: {
        columns: sampleColumns,
        data: sampleMenuItems,
        searchPlaceholder: 'Search menu items...',
        searchColumn: 'name',
        serverSide: false,
    },
    parameters: {
        docs: {
            description: {
                story: 'Basic client-side table with search and column controls. All data is loaded upfront.',
            },
        },
    },
};

export const ServerSide: Story = {
    args: {
        columns: sampleColumns,
        data: sampleMenuItems,
        searchPlaceholder: 'Filter menu items...',
        searchColumn: 'name',
        serverSide: true,
        pagination: {
            pageIndex: 0,
            pageSize: 15,
            pageCount: 5,
            total: 67,
        },
        filters: {
            search: '',
            sort: 'name',
            order: 'asc',
        },
    },
    parameters: {
        docs: {
            description: {
                story: `
**Server-side table example**

This demonstrates how the table works with Laravel backend:
- Search sends requests to server with debouncing
- Sorting updates URL parameters and triggers server request  
- Pagination fetches new pages from server
- State is synchronized between frontend and backend

*Note: In Storybook, server requests are mocked, but in real application this would communicate with your Laravel API.*
        `,
            },
        },
    },
};

export const WithCustomDeleteMessage: Story = {
    args: {
        columns: sampleColumns,
        data: sampleMenuItems,
        searchColumn: 'name',
        getDeleteConfirmationMessage: (item: SampleMenuItem) =>
            `Are you sure you want to delete the menu item "${item.name}"? This will affect navigation structure.`,
    },
    parameters: {
        docs: {
            description: {
                story: 'Table with custom delete confirmation messages. Each item type can have different confirmation text.',
            },
        },
    },
};

export const ColumnVisibilityDemo: Story = {
    args: {
        columns: sampleColumns,
        data: sampleMenuItems,
        tableKey: 'demo-table',
    },
    parameters: {
        docs: {
            description: {
                story: `
**Column Visibility Management**

- Use the "Columns" dropdown to show/hide columns
- Preferences are saved to localStorage with the \`tableKey\`
- "Reset" button restores all columns
- Perfect for users who want to customize their view
        `,
            },
        },
    },
};
