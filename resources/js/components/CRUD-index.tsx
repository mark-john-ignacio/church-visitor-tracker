import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link, router } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export type Column<T> = {
    label: string;
    key: Extract<keyof T, string | number>;
    render?: (row: T) => React.ReactNode;
};
export function CrudIndex<T extends { id: number }>(props: {
    rows: T[];
    columns: Column<T>[];
    resource: string;
    renderMobile?: (rows: T[]) => React.ReactNode;
    onDelete?: (id: number) => void;
}) {
    const { rows, columns, resource, renderMobile, onDelete } = props;
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toDelete, setToDelete] = useState<T | null>(null);

    const handleDelete = useCallback(
        (id: number) => {
            if (onDelete) {
                onDelete(id);
                setConfirmOpen(false);
                return;
            }
            router.delete(route(`admin.${resource}.destroy`, id), {
                onSuccess: () => {
                    toast.success('Deleted');
                    setConfirmOpen(false);
                },
                onError: () => toast.error('Error deleting'),
            });
        },
        [resource, onDelete],
    );
    return (
        <>
            {/* desktop */}
            <div className="hidden sm:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((c) => (
                                <TableHead key={c.key}>{c.label}</TableHead>
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
                                            <Link href={route(`admin.${resource}.edit`, r.id)}>Edit</Link>
                                        </Button>
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
