import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { useDeleteConfirmation } from '@/components/data-table';

export interface SortableColumnConfig {
    accessorKey: string;
    header: string;
}

export interface BadgeColumnConfig {
    accessorKey: string;
    header?:string;
    sortable?:boolean;
    variantMap?: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'>;
    defaultVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
    centerAlign?: boolean;
    fallbackValue?: string;
}

export interface BooleanBadgeColumnConfig {
    accessorKey: string;
    header: string;
    trueLabel?: string;
    falseLabel?: string;
    trueVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
    falseVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export interface ActionColumnConfig<T = any> {
    editRoute: (id:number) => string;
    deleteRoute: (id:number) => string;
    editLabel?: string;
    deleteLabel?:string;
    getItemName: (item:T) => string;
    successMessage?: string;
    errorMessage?: string;
}

export interface ConditionalActionColumnConfig<T = any> {
    editRoute: (id: number) => string;
    deleteRoute: (id: number) => string;
    editLabel?: string;
    deleteLabel?: string;
    getItemName: (item: T) => string;
    successMessage?: string;
    errorMessage?: string;
    canEdit?: (item: T) => boolean;
    canDelete?: (item: T) => boolean;
    getEditLabel?: (item: T) => string;
}

//Sortable text column
export function createSortableColumn<T>(config:SortableColumnConfig): ColumnDef<T> {
    return {
        accessorKey:config.accessorKey,
        header: ({column}) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                {config.header}
                <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
        )
    };
}

//Badge column with customizable variants
export function createBadgeColumn<T>(config: BadgeColumnConfig): ColumnDef<T> {
    const header = config.sortable ? ({column}: any) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            {config.header}
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    )
    : config.header;

    return {
        accessorKey: config.accessorKey,
        header,
        cell: ({ row }) => {
            const value = row.getValue(config.accessorKey) as string;
            const displayValue = value || config.fallbackValue || value; // Use fallback
            const variant = config.variantMap?.[displayValue] || config.defaultVariant || 'outline';
            
            const content = <Badge variant={variant}>{displayValue}</Badge>;
            
            return config.centerAlign ? (
                <div className="text-center">{content}</div>
            ) : content;
        },
    };
}

// Boolean badge column (Yes/No, Active/Inactive, etc.)
export function createBooleanBadgeColumn<T>(config:BooleanBadgeColumnConfig): ColumnDef<T> {
    return {
        accessorKey:config.accessorKey,
        header: config.header,
        cell: ({row}) => {
            const value = row.getValue(config.accessorKey) as boolean;
            const label = value ? (config.trueLabel || 'Yes') : (config.falseLabel || 'No');
            const variant = value ? (config.trueVariant || 'default') : (config.falseVariant || 'outline');

            return (
                <div className='text-center'>
                    <Badge variant={variant}>{label}</Badge>
                </div>
            )
        }
    }
}

// Centered text column
export function createCenteredColumn<T>(accessorKey: string, header: string): ColumnDef<T> {
    return {
        accessorKey,
        header, 
        cell: ({row}) => <div className='text-center'>{row.getValue(accessorKey)}</div>,
    };
}

//Date column
export function createDateColumn<T>(accessorKey:string, header:string, sortable:boolean = true): ColumnDef<T> {
    const headerComponent = sortable ? ({column}: any) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                            {header}
                <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    )
    : header;
    
    return {
        accessorKey,
        header: headerComponent,
        cell: ({ row }) => {
            const date = new Date(row.getValue(accessorKey) as string);
            return date.toLocaleDateString();
        },
    }
}

export function createOptionalColumn<T>(
    accessorKey: string, 
    header: string, 
    sortable: boolean = true,
    emptyText: string = 'N/A'
): ColumnDef<T> {
    const headerComponent = sortable 
        ? ({ column }: any) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                {header}
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        )
        : header;

    return {
        accessorKey,
        header: headerComponent,
        cell: ({ row }) => {
            const value = row.getValue(accessorKey) as string;
            return value || <span className="text-muted-foreground">{emptyText}</span>;
        },
    };
}



// Actions column with edit/delete
export function createActionsColumn<T>(config: ActionColumnConfig<T>): ColumnDef<T> {
    return {
        id: 'actions',
        cell: ({ row }) => {
            const item = row.original;
            const { confirmDelete } = useDeleteConfirmation();

            const handleDelete = () => {
                const deleteAction = () => {
                    router.delete(config.deleteRoute((item as any).id), {
                        onSuccess: () => {
                            toast.success(config.successMessage || 'Item deleted successfully');
                        },
                        onError: (errors) => {
                            const errorMessage = errors.default || config.errorMessage || 'Failed to delete item';
                            toast.error(errorMessage);
                        },
                    });
                };

                const customMessage = `Are you sure you want to delete "${config.getItemName(item)}"? This action cannot be undone.`;
                confirmDelete(item, deleteAction, customMessage);
            };

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={config.editRoute((item as any).id)}>
                                {config.editLabel || 'Edit'}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                            {config.deleteLabel || 'Delete'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    };
}


export function createConditionalActionsColumn<T>(config: ConditionalActionColumnConfig<T>): ColumnDef<T> {
    return {
        id: 'actions',
        cell: ({ row }) => {
            const item = row.original;
            const { confirmDelete } = useDeleteConfirmation();

            const canEdit = config.canEdit ? config.canEdit(item) : true;
            const canDelete = config.canDelete ? config.canDelete(item) : true;
            const editLabel = config.getEditLabel ? config.getEditLabel(item) : (config.editLabel || 'Edit');

            const handleDelete = () => {
                const deleteAction = () => {
                    router.delete(config.deleteRoute((item as any).id), {
                        onSuccess: () => {
                            toast.success(config.successMessage || 'Item deleted successfully');
                        },
                        onError: (errors) => {
                            const errorMessage = errors.default || config.errorMessage || 'Failed to delete item';
                            toast.error(errorMessage);
                        },
                    });
                };

                const customMessage = `Are you sure you want to delete "${config.getItemName(item)}"? This action cannot be undone.`;
                confirmDelete(item, deleteAction, customMessage);
            };

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={config.editRoute((item as any).id)}>
                                {editLabel}
                            </Link>
                        </DropdownMenuItem>
                        {canDelete && (
                            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                                {config.deleteLabel || 'Delete'}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    };
}