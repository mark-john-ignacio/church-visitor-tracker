import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

type DisplayedRef = Partial<Record<keyof FlashMessages, string>>;

export default function useFlashToast() {
    const { props } = usePage<{ flash: FlashMessages }>();
    const flash = props.flash ?? {};
    const displayedRef = useRef<DisplayedRef>({});

    useEffect(() => {
        (Object.keys(flash) as Array<keyof FlashMessages>).forEach((type) => {
            const message = flash[type];

            if (message && displayedRef.current[type] !== message) {
                switch (type) {
                    case 'success':
                        toast.success('Success', { description: message });
                        break;
                    case 'error':
                        toast.error('Error', { description: message });
                        break;
                    case 'warning':
                        toast.warning('Warning', { description: message });
                        break;
                    case 'info':
                        toast.info('Info', { description: message });
                        break;
                }
                displayedRef.current[type] = message;
            }
        });
    }, [flash.success, flash.error, flash.warning, flash.info]);
}
