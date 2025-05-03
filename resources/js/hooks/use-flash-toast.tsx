import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type Flash = { success?: string; error?: string };

export default function useFlashToast() {
    const { flash } = usePage<{ flash?: Flash }>().props;
    const { success, error } = flash ?? {};

    useEffect(() => {
        if (success) toast.success(success);
        if (error) toast.error(error);
    }, [success, error]);
}
