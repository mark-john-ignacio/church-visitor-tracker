import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';
import React from 'react';

interface DynamicIconProps extends LucideProps {
    name: keyof typeof LucideIcons;
    className?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = '', ...props }) => {
    const IconComponent = LucideIcons[name] as React.ComponentType<LucideIcons.LucideProps> | undefined;

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found in Lucide icons`);
        return null;
    }

    return <IconComponent className={className} {...props} />;
};
