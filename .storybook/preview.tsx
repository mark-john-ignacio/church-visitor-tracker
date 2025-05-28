import type { Preview } from '@storybook/react';
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
    },
    decorators: [
        (Story) => (
            <div className="mx-auto max-w-6xl p-6">
                <Story />
            </div>
        ),
    ],
};

export default preview;
