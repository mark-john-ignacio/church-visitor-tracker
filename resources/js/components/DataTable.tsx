import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LaravelPaginator } from '@/types';
import { Link, router } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useCallback, useState, type ReactNode } from 'react';
import { toast } from 'sonner';

export interface Column<T> {
    label: string;
    key: keyof T | string;
    sortable?: boolean;
    className?: string;
    render?: (item: T) => ReactNode;
}

export type SortDirection = 'asc' | 'desc' | null;

interface DataTableProps<T extends { id: number }> {
    data: T[];
    columns: Column<T>[];
    resource: string;
    routePrefix?: string;
    renderMobile?: (data: T[]) => ReactNode;
    onDelete?: (id: number) => void;
    paginator?: LaravelPaginator<T>;
    searchable?: boolean;
    onSearch?: (searchTerm: string) => void;
    onSort?: (column: string, direction: SortDirection) => void;
    canDelete?: (item: T) => boolean;
}

export function DataTable<T extends { id: number }>({
    data,
    columns,
    resource,
    routePrefix = 'admin',
    renderMobile,
    onDelete,
    paginator,
    searchable = false,
    onSearch,
    onSort,
    canDelete = () => true,
}: DataTableProps<T>) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<T | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentSortColumn, setCurrentSortColumn] = useState<string | null>(null);
    const [currentSortDirection, setCurrentSortDirection] = useState<SortDirection>(null);

    const fullRoutePrefix = routePrefix ? `${routePrefix}.` : '';

    const handleDeleteItem = useCallback(
        (id: number) => {
            if (onDelete) {
                onDelete(id);
                setIsDeleteDialogOpen(false);
                return;
            }

            router.delete(route(`${fullRoutePrefix}${resource}.destroy`, id), {
                onSuccess: () => {
                    toast.success('Record deleted successfully');
                    setIsDeleteDialogOpen(false);
                },
                onError: () => {
                    toast.error('Failed to delete record');
                },
            });
        },
        [resource, onDelete, fullRoutePrefix],
    );

    const handleSearchSubmit = useCallback(() => {
        if (onSearch && searchQuery.trim()) {
            onSearch(searchQuery.trim());
        }
    }, [searchQuery, onSearch]);

    const handleColumnSort = useCallback(
        (column: string) => {
            if (!onSort) return;

            let newDirection: SortDirection = 'asc';

            if (currentSortColumn === column) {
                if (currentSortDirection === 'asc') {
                    newDirection = 'desc';
                } else if (currentSortDirection === 'desc') {
                    newDirection = null;
                }
            }

            setCurrentSortColumn(newDirection ? column : null);
            setCurrentSortDirection(newDirection);
            onSort(column, newDirection);
        },
        [currentSortColumn, currentSortDirection, onSort],
    );

    const openDeleteDialog = useCallback((item: T) => {
        setItemToDelete(item);
        setIsDeleteDialogOpen(true);
    }, []);

    const closeDeleteDialog = useCallback(() => {
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
    }, []);

    const confirmDeleteAction = useCallback(() => {
        if (itemToDelete) {
            handleDeleteItem(itemToDelete.id);
        }
    }, [itemToDelete, handleDeleteItem]);

    const renderCellContent = useCallback((item: T, column: Column<T>) => {
        if (column.render) {
            return column.render(item);
        }
        return item[column.key as keyof T] as ReactNode;
    }, []);

    const renderSortIndicator = useCallback(
        (columnKey: string) => {
            if (currentSortColumn !== columnKey) return null;

            return (
                <span className="ml-1">
                    {currentSortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
            );
        },
        [currentSortColumn, currentSortDirection],
    );

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            {searchable && (
                <div className="flex items-center gap-2">
                    <div className="relative max-w-sm flex-1">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                            className="pl-9"
                        />
                    </div>
                    <Button variant="secondary" onClick={handleSearchSubmit}>
                        Search
                    </Button>
                </div>
            )}

            {/* Desktop Table */}
            <div className="hidden sm:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead
                                    key={String(column.key)}
                                    className={`${column.className || ''} ${column.sortable ? 'hover:bg-muted cursor-pointer' : ''}`}
                                    onClick={() => column.sortable && handleColumnSort(String(column.key))}
                                >
                                    <div className="flex items-center">
                                        {column.label}
                                        {column.sortable && renderSortIndicator(String(column.key))}
                                    </div>
                                </TableHead>
                            ))}
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} className="text-muted-foreground py-8 text-center">
                                    No records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item) => (
                                <TableRow key={item.id}>
                                    {columns.map((column) => (
                                        <TableCell key={`${item.id}-${String(column.key)}`} className={column.className}>
                                            {renderCellContent(item, column)}
                                        </TableCell>
                                    ))}
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={route(`${fullRoutePrefix}${resource}.edit`, item.id)}>Edit</Link>
                                            </Button>
                                            {canDelete(item) && (
                                                <Button size="sm" variant="destructive" onClick={() => openDeleteDialog(item)}>
                                                    Delete
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile View */}
            <div className="sm:hidden">
                {data.length === 0 ? (
                    <div className="text-muted-foreground py-8 text-center">No records found.</div>
                ) : renderMobile ? (
                    renderMobile(data)
                ) : (
                    <div className="text-muted-foreground text-center">Mobile view not implemented.</div>
                )}
            </div>

            {/* Pagination */}
            {paginator && (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-muted-foreground text-sm">
                        Showing {paginator.from ?? 0}–{paginator.to ?? 0} of {paginator.total} results
                    </span>
                    <div className="flex flex-wrap gap-1">
                        {paginator.links.map((link, index) =>
                            link.url ? (
                                <Button key={index} asChild size="sm" variant={link.active ? 'default' : 'outline'}>
                                    <Link href={link.url} preserveScroll preserveState dangerouslySetInnerHTML={{ __html: link.label }} />
                                </Button>
                            ) : (
                                <Button key={index} size="sm" variant="outline" disabled dangerouslySetInnerHTML={{ __html: link.label }} />
                            ),
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this record? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeDeleteDialog}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDeleteAction}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
