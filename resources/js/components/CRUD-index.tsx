import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LaravelPaginator } from '@/types';
import { Link, router } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export type Column<T> = {
    label: string;
    key: Extract<keyof T, string | number>;
    sortable?: boolean;
    render?: (row: T) => React.ReactNode;
};

export type SortDirection = 'asc' | 'desc' | null;

export function CrudIndex<T extends { id: number }>(props: {
    rows: T[];
    columns: Column<T>[];
    resource: string;
    routePrefix?: string;
    renderMobile?: (rows: T[]) => React.ReactNode;
    onDelete?: (id: number) => void;
    paginator?: LaravelPaginator<T>;
    searchable?: boolean;
    onSearch?: (searchTerm: string) => void;
    onSort?: (column: string, direction: SortDirection) => void;
    canDelete?: (row: T) => boolean;
}) {
    const {
        rows,
        columns,
        resource,
        routePrefix = 'admin',
        renderMobile,
        onDelete,
        paginator,
        searchable,
        onSearch,
        onSort,
        canDelete = () => true,
    } = props;
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
                    toast.success('Deleted');
                    setConfirmOpen(false);
                },
                onError: () => toast.error('Error deleting'),
            });
        },
        [resource, onDelete, fullRoutePrefix],
    );

    const handleSearch = useCallback(() => {
        if (onSearch) {
            onSearch(searchTerm);
        }
    }, [searchTerm, onSearch]);

    const handleSort = useCallback(
        (column: string) => {
            if (!onSort) return;

            let newDirection: SortDirection = 'asc';
            if (sortColumn === column) {
                if (sortDirection === 'asc') newDirection = 'desc';
                else if (sortDirection === 'desc') newDirection = null;
                else newDirection = 'asc';
            }

            setSortColumn(newDirection ? column : null);
            setSortDirection(newDirection);
            onSort(column, newDirection);
        },
        [sortColumn, sortDirection, onSort],
    );

    const handleKeyPress = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        },
        [handleSearch],
    );

    return (
        <>
            {/* Search */}
            {searchable && (
                <div className="mb-4 flex items-center">
                    <div className="relative w-full md:w-72">
                        <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                        <Input
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="pl-8"
                        />
                    </div>
                    <Button variant="secondary" className="ml-2" onClick={handleSearch}>
                        Search
                    </Button>
                </div>
            )}

            {/* desktop */}
            <div className="hidden sm:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((c) => (
                                <TableHead
                                    key={c.key}
                                    className={c.sortable ? 'hover:bg-muted cursor-pointer' : ''}
                                    onClick={() => c.sortable && handleSort(String(c.key))}
                                >
                                    <div className="flex items-center">
                                        {c.label}
                                        {c.sortable && sortColumn === c.key && (
                                            <span className="ml-1">
                                                {sortDirection === 'asc' ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : sortDirection === 'desc' ? (
                                                    <ChevronDown className="h-4 w-4" />
                                                ) : null}
                                            </span>
                                        )}
                                    </div>
                                </TableHead>
                            ))}
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} className="text-muted-foreground py-6 text-center">
                                    No records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map((r) => (
                                <TableRow key={r.id}>
                                    {columns.map((c) => (
                                        <TableCell key={`${r.id}-${String(c.key)}`}>{c.render ? c.render(r) : (r[c.key] as any)}</TableCell>
                                    ))}
                                    <TableCell className="text-right">
                                        <Button size="sm" className="mr-2" variant="outline" asChild>
                                            <Link href={route(`${fullRoutePrefix}${resource}.edit`, r.id)}>Edit</Link>
                                        </Button>
                                        {canDelete(r) && (
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => {
                                                    setToDelete(r);
                                                    setConfirmOpen(true);
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* mobile */}
            <div className="flex flex-col gap-4 sm:hidden">
                {rows.length === 0 ? (
                    <div className="text-muted-foreground py-6 text-center">No records found.</div>
                ) : renderMobile ? (
                    renderMobile(rows)
                ) : null}
            </div>

            {/* Pagination */}
            {paginator && (
                <div className="mt-4 flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                        Showing {paginator.from ?? 0}–{paginator.to ?? 0} of {paginator.total}
                    </span>
                    <div className="flex gap-1">
                        {paginator.links.map((l, i) =>
                            l.url ? (
                                <Button key={i} asChild size="sm" variant={l.active ? 'default' : 'outline'}>
                                    <Link href={l.url} preserveScroll preserveState dangerouslySetInnerHTML={{ __html: l.label }} />
                                </Button>
                            ) : (
                                <Button key={i} size="sm" variant="outline" disabled dangerouslySetInnerHTML={{ __html: l.label }} />
                            ),
                        )}
                    </div>
                </div>
            )}

            {/* confirm dialog */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm deletion?</DialogTitle>
                        <DialogDescription>This cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (toDelete) handleDelete(toDelete.id);
                            }}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
