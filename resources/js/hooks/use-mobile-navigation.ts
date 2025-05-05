import { useCallback } from 'react';

export function useMobileNavigationCleanup() {
    return useCallback(() => {
        document.body.style.removeProperty('pointer-events');
    }, []);
}
