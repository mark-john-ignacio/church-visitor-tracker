import type { Preview } from '@storybook/react';
import React from 'react';
import '../resources/css/app.css';

const preview: Preview = {
    parameters: {
        actions: { argTypesRegex: '^on[A-Z].*' },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        docs: {
            toc: true,
        },
    },
    decorators: [
        (Story) => (
      <div className="p-6 max-w-6xl mx-auto">
        <Story />
      </div>
        ),
    ],
};

export default preview;
