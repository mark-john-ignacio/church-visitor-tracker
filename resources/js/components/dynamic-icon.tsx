import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface DynamicIconProps {
    name: string;
    className?: string;
}

export function DynamicIcon({ name, className = '' }: DynamicIconProps) {
    const IconComponent = (LucideIcons as Record<string, LucideIcon>)[name];

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found in Lucide icons`);
        return null;
    }

    return <IconComponent className={className} />;
}
