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

interface CrudIndexProps<T extends { id: number }> {
    rows: T[];
    columns: Column<T>[];
    resource: string;
    routePrefix?: string;
    renderMobile?: (rows: T[]) => ReactNode;
    onDelete?: (id: number) => void;
    paginator?: LaravelPaginator<T>;
    searchable?: boolean;
    onSearch?: (searchTerm: string) => void;
    onSort?: (column: string, direction: SortDirection) => void;
    canDelete?: (row: T) => boolean;
}

export function DataTable<T extends { id: number }>({
    rows,
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
}: CrudIndexProps<T>) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toDelete, setToDelete] = useState<T | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    const fullRoutePrefix = routePrefix ? `${routePrefix}.` : '';

    const handleDelete = useCallback(
        (id: number) => {
            if (onDelete) {
                onDelete(id);
                setConfirmOpen(false);
                return;
            }

            router.delete(route(`${fullRoutePrefix}${resource}.destroy`, id), {
                onSuccess: () => {
                    toast.success('Record deleted successfully');
                    setConfirmOpen(false);
                },
                onError: () => {
                    toast.error('Failed to delete record');
                },
            });
        },
        [resource, onDelete, fullRoutePrefix],
    );

    const handleSearch = useCallback(() => {
        if (onSearch && searchTerm.trim()) {
            onSearch(searchTerm.trim());
        }
    }, [searchTerm, onSearch]);

    const handleSort = useCallback(
        (column: string) => {
            if (!onSort) return;

            let newDirection: SortDirection = 'asc';

            if (sortColumn === column) {
                if (sortDirection === 'asc') {
                    newDirection = 'desc';
                } else if (sortDirection === 'desc') {
                    newDirection = null;
                }
            }

            setSortColumn(newDirection ? column : null);
            setSortDirection(newDirection);
            onSort(column, newDirection);
        },
        [sortColumn, sortDirection, onSort],
    );

    const openDeleteDialog = useCallback((item: T) => {
        setToDelete(item);
        setConfirmOpen(true);
    }, []);

    const closeDeleteDialog = useCallback(() => {
        setConfirmOpen(false);
        setToDelete(null);
    }, []);

    const confirmDelete = useCallback(() => {
        if (toDelete) {
            handleDelete(toDelete.id);
        }
    }, [toDelete, handleDelete]);

    const renderTableCell = useCallback((item: T, column: Column<T>) => {
        if (column.render) {
            return column.render(item);
        }
        return item[column.key as keyof T] as ReactNode;
    }, []);

    const renderSortIcon = useCallback(
        (columnKey: string) => {
            if (sortColumn !== columnKey) return null;

            return <span className="ml-1">{sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>;
        },
        [sortColumn, sortDirection],
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
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-9"
                        />
                    </div>
                    <Button variant="secondary" onClick={handleSearch}>
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
                                    onClick={() => column.sortable && handleSort(String(column.key))}
                                >
                                    <div className="flex items-center">
                                        {column.label}
                                        {column.sortable && renderSortIcon(String(column.key))}
                                    </div>
                                </TableHead>
                            ))}
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} className="text-muted-foreground py-8 text-center">
                                    No records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map((item) => (
                                <TableRow key={item.id}>
                                    {columns.map((column) => (
                                        <TableCell key={`${item.id}-${String(column.key)}`} className={column.className}>
                                            {renderTableCell(item, column)}
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
                {rows.length === 0 ? (
                    <div className="text-muted-foreground py-8 text-center">No records found.</div>
                ) : renderMobile ? (
                    renderMobile(rows)
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
            <Dialog open={confirmOpen} onOpenChange={closeDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this record? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeDeleteDialog}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
