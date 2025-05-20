import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function AnnouncementBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if the announcement has been dismissed before
        const announcementDismissed = localStorage.getItem('company_switcher_announced');
        if (!announcementDismissed) {
            setIsVisible(true);
        }
    }, []);

    const dismissAnnouncement = () => {
        localStorage.setItem('company_switcher_announced', 'true');
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="bg-primary/10 text-primary flex items-center justify-between px-4 py-2">
            <div className="flex-1 text-center text-sm">
                <span className="font-medium">New Feature!</span> You can now easily switch between your companies.
            </div>
            <button onClick={dismissAnnouncement} className="text-primary/70 hover:text-primary ml-2">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
