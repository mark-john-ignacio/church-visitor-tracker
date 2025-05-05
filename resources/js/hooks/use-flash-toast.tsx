import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

type Flash = { success?: string; error?: string };

export default function useFlashToast() {
    const page = usePage<{ flash?: Flash }>();
    const { flash } = page.props;
    const { success, error } = flash ?? {};
    const displayedRef = useRef<{ success?: string; error?: string }>({});

    useEffect(() => {
        if (success && displayedRef.current.success !== success) {
            toast.success(success);
            displayedRef.current.success = success;

            // Clear from Inertia props to prevent re-showing
            if (page.props.flash) {
                page.props.flash.success = undefined;
            }
        }

        if (error && displayedRef.current.error !== error) {
            toast.error(error);
            displayedRef.current.error = error;

            // Clear from Inertia props to prevent re-showing
            if (page.props.flash) {
                page.props.flash.error = undefined;
            }
        }
    }, [success, error]);
}
