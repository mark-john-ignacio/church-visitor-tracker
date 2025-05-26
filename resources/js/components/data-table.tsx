'use client';

import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { router } from '@inertiajs/react';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchPlaceholder?: string;
    searchColumn?: string;
    tableKey?: string;
    onDelete?: (item: TData) => void;
    getDeleteConfirmationMessage?: (item: TData) => string;
    // Server-side pagination props
    pagination?: {
        pageIndex: number;
        pageSize: number;
        pageCount: number;
        total: number;
    };
    serverSide?: boolean;
    // Add filters prop to sync with server state
    filters?: {
        search?: string;
        sort?: string;
        order?: string;
    };
}

// Context for delete confirmation
const DeleteConfirmationContext = React.createContext<{
    confirmDelete: (item: any, onConfirm: () => void, message?: string) => void;
} | null>(null);

export function useDeleteConfirmation() {
    const context = React.useContext(DeleteConfirmationContext);
    if (!context) {
        throw new Error('useDeleteConfirmation must be used within DataTable');
    }
    return context;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchPlaceholder = 'Search...',
    searchColumn,
    tableKey = 'default-table',
    onDelete,
    getDeleteConfirmationMessage,
    pagination,
    serverSide = false,
    filters,
}: DataTableProps<TData, TValue>) {
    // Initialize sorting state from server filters
    const [sorting, setSorting] = React.useState<SortingState>(() => {
        if (serverSide && filters?.sort) {
            return [
                {
                    id: filters.sort,
                    desc: filters.order === 'desc',
                },
            ];
        }
        return [];
    });

    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    // Delete confirmation state
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [itemToDelete, setItemToDelete] = React.useState<TData | null>(null);
    const [deleteMessage, setDeleteMessage] = React.useState('');
    const [onConfirmDelete, setOnConfirmDelete] = React.useState<(() => void) | null>(null);

    // Load saved column visibility from localStorage
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem(`table-visibility-${tableKey}`);
                return saved ? JSON.parse(saved) : {};
            } catch {
                return {};
            }
        }
        return {};
    });

    // Save column visibility to localStorage whenever it changes
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(`table-visibility-${tableKey}`, JSON.stringify(columnVisibility));
            } catch (error) {
                console.warn('Failed to save table visibility preferences:', error);
            }
        }
    }, [columnVisibility, tableKey]);

    // Handle server-side sorting
    const handleSorting = React.useCallback(
        (updater: any) => {
            const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
            setSorting(newSorting);

            if (serverSide) {
                const url = new URL(window.location.href);

                if (newSorting.length > 0) {
                    const sort = newSorting[0];
                    url.searchParams.set('sort', sort.id);
                    url.searchParams.set('order', sort.desc ? 'desc' : 'asc');
                } else {
                    url.searchParams.delete('sort');
                    url.searchParams.delete('order');
                }

                url.searchParams.set('page', '1'); // Reset to first page

                router.get(
                    url.toString(),
                    {},
                    {
                        preserveState: true,
                        preserveScroll: true,
                    },
                );
            }
        },
        [serverSide, sorting],
    );

    const table = useReactTable({
        data,
        columns,
        onSortingChange: handleSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: serverSide ? undefined : getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        // Server-side pagination
        ...(serverSide && pagination
            ? {
                  pageCount: pagination.pageCount,
                  manualPagination: true,
                  manualSorting: true,
                  manualFiltering: true,
              }
            : {
                  getPaginationRowModel: getPaginationRowModel(),
              }),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            ...(serverSide && pagination
                ? {
                      pagination: {
                          pageIndex: pagination.pageIndex,
                          pageSize: pagination.pageSize,
                      },
                  }
                : {}),
        },
    });

    // Function to reset column visibility to default
    const resetColumnVisibility = React.useCallback(() => {
        setColumnVisibility({});
        if (typeof window !== 'undefined') {
            localStorage.removeItem(`table-visibility-${tableKey}`);
        }
    }, [tableKey]);

    // Handle server-side pagination
    const handlePagination = React.useCallback(
        (pageIndex: number) => {
            if (serverSide) {
                const url = new URL(window.location.href);
                url.searchParams.set('page', String(pageIndex + 1));
                router.get(
                    url.toString(),
                    {},
                    {
                        preserveState: true,
                        preserveScroll: true,
                    },
                );
            }
        },
        [serverSide],
    );

    // Handle server-side search with debouncing
    const handleSearch = React.useCallback(
        (value: string) => {
            if (serverSide) {
                const url = new URL(window.location.href);
                if (value) {
                    url.searchParams.set('search', value);
                } else {
                    url.searchParams.delete('search');
                }
                url.searchParams.set('page', '1'); // Reset to first page
                router.get(
                    url.toString(),
                    {},
                    {
                        preserveState: true,
                        preserveScroll: true,
                    },
                );
            }
        },
        [serverSide],
    );

    // Debounced search ref
    const searchTimeoutRef = React.useRef<NodeJS.Timeout>();

    const handleSearchInput = React.useCallback(
        (value: string) => {
            if (serverSide) {
                if (searchTimeoutRef.current) {
                    clearTimeout(searchTimeoutRef.current);
                }
                searchTimeoutRef.current = setTimeout(() => {
                    handleSearch(value);
                }, 500);
            } else {
                table.getColumn(searchColumn)?.setFilterValue(value);
            }
        },
        [serverSide, handleSearch, table, searchColumn],
    );

    // Delete confirmation function
    const confirmDelete = React.useCallback(
        (item: TData, onConfirm: () => void, customMessage?: string) => {
            setItemToDelete(item);
            setOnConfirmDelete(() => onConfirm);

            if (customMessage) {
                setDeleteMessage(customMessage);
            } else if (getDeleteConfirmationMessage) {
                setDeleteMessage(getDeleteConfirmationMessage(item));
            } else {
                setDeleteMessage('Are you sure you want to delete this item? This action cannot be undone.');
            }

            setDeleteDialogOpen(true);
        },
        [getDeleteConfirmationMessage],
    );

    const handleConfirmDelete = React.useCallback(() => {
        if (onConfirmDelete) {
            onConfirmDelete();
        }
        setDeleteDialogOpen(false);
        setItemToDelete(null);
        setOnConfirmDelete(null);
        setDeleteMessage('');
    }, [onConfirmDelete]);

    const handleCancelDelete = React.useCallback(() => {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
        setOnConfirmDelete(null);
        setDeleteMessage('');
    }, []);

    const deleteContextValue = React.useMemo(
        () => ({
            confirmDelete,
        }),
        [confirmDelete],
    );

    return (
        <DeleteConfirmationContext.Provider value={deleteContextValue}>
            <div className="w-full">
                <div className="flex items-center py-4">
                    {searchColumn && (
                        <Input
                            placeholder={searchPlaceholder}
                            defaultValue={filters?.search || ''}
                            onChange={(event) => handleSearchInput(event.target.value)}
                            className="max-w-sm"
                        />
                    )}
                    <div className="ml-auto flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={resetColumnVisibility} className="h-8 px-2 lg:px-3">
                            Reset
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="ml-auto">
                                    Columns
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => {
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                            >
                                                {column.id}
                                            </DropdownMenuCheckboxItem>
                                        );
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between space-x-2 py-4">
                    <div className="text-muted-foreground text-sm">
                        {serverSide && pagination ? (
                            <>
                                Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
                                {Math.min((pagination.pageIndex + 1) * pagination.pageSize, pagination.total)} of {pagination.total} results
                            </>
                        ) : (
                            <>
                                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                                {Math.min(
                                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                    table.getFilteredRowModel().rows.length,
                                )}{' '}
                                of {table.getFilteredRowModel().rows.length} results
                            </>
                        )}
                    </div>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (serverSide) {
                                    handlePagination(table.getState().pagination.pageIndex - 1);
                                } else {
                                    table.previousPage();
                                }
                            }}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (serverSide) {
                                    handlePagination(table.getState().pagination.pageIndex + 1);
                                } else {
                                    table.nextPage();
                                }
                            }}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogDescription>{deleteMessage}</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={handleCancelDelete}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleConfirmDelete}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DeleteConfirmationContext.Provider>
    );
}
