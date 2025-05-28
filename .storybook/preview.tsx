import type { Preview } from '@storybook/react';
import { themes } from '@storybook/theming';
import { useEffect } from 'react';
import { useDarkMode } from 'storybook-dark-mode';
import '../resources/css/app.css';

const preview: Preview = {
    parameters: {
        actions: { argTypesRegex: '^on[A-Z].*' },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
        docs: {
            toc: true,
        },
        darkMode: {
            dark: { ...themes.dark, appBg: '#0a0a0a' },
            light: { ...themes.normal, appBg: '#ffffff' },
            current: 'light',
            stylePreview: true,
        },
        backgrounds: {
            default: 'light',
            values: [
                {
                    name: 'light',
                    value: '#ffffff',
                },
                {
                    name: 'dark',
                    value: '#0a0a0a',
                },
            ],
        },
    },
    decorators: [
        (Story) => {
            const isDarkMode = useDarkMode();

            useEffect(() => {
                // Apply your app's theme logic - same as your useAppearance hook
                const appearance = isDarkMode ? 'dark' : 'light';

                // Apply the dark class exactly like your app does
                document.documentElement.classList.toggle('dark', isDarkMode);

                // Optional: Sync with localStorage like your app
                if (typeof window !== 'undefined') {
                    localStorage.setItem('appearance', appearance);
                }
            }, [isDarkMode]);

            return (
                <div className="bg-background text-foreground mx-auto max-w-6xl p-6">
                    <Story />
                </div>
            );
        },
    ],
};

export default preview;
