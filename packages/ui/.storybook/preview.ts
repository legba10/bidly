import type { Preview } from '@storybook/react-vite';

import '../src/styles.css';

const preview: Preview = {
  tags: ['autodocs', 'test'],
  parameters: {
    a11y: {
      test: 'error',
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'],
        },
      },
    },
    controls: {
      expanded: true,
    },
  },
};

export default preview;
