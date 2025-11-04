import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../design-system/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../design-system/**/*.mdx',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {
    builder: '@storybook/builder-vite',
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '/design-system',
      '@/design-system': '/design-system',
      '@/src': '/src',
    };
    return config;
  },
  staticDirs: ['../design-system/assets'],
};

export default config;