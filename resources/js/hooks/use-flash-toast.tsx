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
        // Clear flash messages from Inertia props after displaying them
        const cleanup = () => {
            if (props.flash) {
                // This is a bit of a hack but prevents duplicate toasts
                setTimeout(() => {
                    if (props.flash) {
                        Object.keys(props.flash).forEach((key) => {
                            // @ts-ignore - This is modifying the props directly, which is not ideal
                            // but works to prevent duplicate toasts
                            props.flash[key as keyof FlashMessages] = null;
                        });
                    }
                }, 100);
            }
        };

        (Object.keys(flash) as Array<keyof FlashMessages>).forEach((type) => {
            const message = flash[type];

            if (message && displayedRef.current[type] !== message) {
                switch (type) {
                    case 'success':
                        toast.success(message);
                        break;
                    case 'error':
                        toast.error(message);
                        break;
                    case 'warning':
                        toast.warning(message);
                        break;
                    case 'info':
                        toast.info(message);
                        break;
                }
                displayedRef.current[type] = message;
            }
        });

        return cleanup;
    }, [flash.success, flash.error, flash.warning, flash.info]);
}
