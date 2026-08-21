import '../src/styles/reset.css';
import '../src/styles/animations.css';
import './preview.css';

import type { Preview } from '@storybook/react-vite';

// TODO(phase 3): wrap in <RefractProvider> once ThemeProvider/RefractProvider
// are copied over, and inline tokenStyles the way _document.page.tsx does.
const preview: Preview = {
  initialGlobals: { theme: 'dark' },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      toolbar: {
        icon: 'paintbrush',
        items: ['light', 'dark'],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme as 'light' | 'dark';
      document.body.dataset.theme = theme;
      return (
        <div id="story-root" className="storyRoot">
          <Story />
          <div id="portal-root" />
        </div>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
    controls: { hideNoControlsWarning: true },
  },
};

export default preview;
