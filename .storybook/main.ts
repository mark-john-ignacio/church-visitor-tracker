import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
    stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
    addons: [
        '@storybook/addon-essentials',
        'storybook-dark-mode', // Add dark mode addon
    ],
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
    docs: {
        autodocs: 'tag',
    },
    viteFinal: async (config) => {
        return mergeConfig(config, {
            resolve: {
                alias: {
                    '@': path.resolve(__dirname, '../resources/js'),
                },
            },
            css: {
                postcss: path.resolve(__dirname, '../postcss.config.js'),
            },
            define: {
                global: 'globalThis',
            },
        });
    },
};

export default config;
