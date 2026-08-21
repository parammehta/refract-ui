import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  staticDirs: ['../public'],
  framework: { name: '@storybook/react-vite', options: {} },
};

export default config;
