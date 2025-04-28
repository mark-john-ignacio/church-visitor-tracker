import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props} // Pass down className, etc.
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Simple bar chart with increasing height */}
            {/* Bars align at y=20 */}
            <rect x="4" y="10" width="4" height="10" rx="1"></rect> {/* Smallest */}
            <rect x="10" y="7" width="4" height="13" rx="1"></rect> {/* Medium */}
            <rect x="16" y="4" width="4" height="16" rx="1"></rect> {/* Tallest */}
        </svg>
    );
}
