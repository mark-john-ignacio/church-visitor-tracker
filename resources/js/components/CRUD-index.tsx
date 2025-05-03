import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export function CrudIndex<T extends { id: number }>(props: {
    rows: T[];
    columns: Array<{ label: string; key: keyof T; render?: (r: T) => React.ReactNode }>;
    resource: string;
    renderMobile?: (rows: T[]) => React.ReactNode;
}) {
    const { rows, columns, resource, renderMobile } = props;
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toDelete, setToDelete] = useState<T | null>(null);

    const handleDelete = useCallback(
        (id: number) => {
            router.delete(route(`admin.${resource}.destroy`, id), {
                onSuccess: () => toast.success('Deleted'),
                onError: () => toast.error('Error deleting'),
            });
        },
        [resource],
    );
    return (
        <>
            {/* desktop */}
            <div className="hidden sm:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((c, i) => (
                                <TableHead key={i}>{c.label}</TableHead>
                            ))}
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((r) => (
                            <TableRow key={r.id}>
                                {columns.map((c, i) => (
                                    <TableCell key={i}>{c.render ? c.render(r) : (r[c.key] as any)}</TableCell>
                                ))}
                                <TableCell className="text-right">
                                    <Button size="sm" className="mr-2" variant="outline" asChild>
                                        <a href={route(`admin.${resource}.edit`, r.id)}>Edit</a>
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
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* mobile */}
            <div className="flex flex-col gap-4 sm:hidden">{renderMobile ? renderMobile(rows) : null}</div>

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
                                setConfirmOpen(false);
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
