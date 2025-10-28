import type { Preview } from '@storybook/react';
import type { Decorator } from '@storybook/react';
import '../src/styles/globals.css';

const viewportResetDecorator: Decorator = (StoryFn, context) => {
  // Reset viewport when story changes
  if (typeof document !== 'undefined') {
    const viewportElement = document.querySelector('#storybook-preview-iframe') as HTMLElement | null;
    if (viewportElement) {
      viewportElement.style.width = '100%';
      viewportElement.style.height = '100%';
    }
  }
  return StoryFn();
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      defaultViewport: 'responsive',
    },
  },
  decorators: [viewportResetDecorator],
};

export default preview;
