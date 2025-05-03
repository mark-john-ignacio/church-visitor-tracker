import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export function CrudIndex<T extends { id: number; name: string }>(props: {
    rows: T[];
    columns: Array<{ label: string; key: keyof T; render?: (r: T) => React.ReactNode }>;
    resource: string; // e.g. 'users'
}) {
    const { rows, columns, resource } = props;
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toDelete, setDelete] = useState<T | null>(null);

    const handleDelete = useCallback((id: number) => {
        import('@inertiajs/react').then(({ router }) => {
            router.delete(route(`admin.${resource}.destroy`, id), {
                onSuccess: () => toast.success('Deleted'),
                onError: () => toast.error('Error'),
            });
        });
    }, []);

    return (
        <>
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
                                <Button size="sm" variant="outline" asChild>
                                    <a href={route(`admin.${resource}.edit`, r.id)}>Edit</a>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                        setDelete(r);
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
