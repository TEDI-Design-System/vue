import type { Meta, StoryObj } from '@storybook/vue3-vite';

import TediFeedbackText from './TediFeedbackText.vue';

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.65.83?node-id=9165-62054&m=dev" target="_BLANK">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/67d4de-feedbacktext" target="_BLANK">Zeroheight ↗</a>
 *
 * Give the FeedbackText an `id` and reference it from the form control's `aria-describedby`, or screen
 * readers won't connect the text to the control.
 */
const meta = {
  title: 'TEDI-Ready/Components/Form/FeedbackText',
  component: TediFeedbackText,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.65.83?node-id=9165-62054&m=dev',
    },
  },
  argTypes: {
    type: { control: 'radio', options: ['hint', 'valid', 'error'] },
    position: { control: 'radio', options: ['left', 'right'] },
  },
} satisfies Meta<typeof TediFeedbackText>;

export default meta;
type Story = StoryObj<typeof meta>;

const renderWithText = (text: string): Story['render'] => {
  return (args) => ({
    components: { TediFeedbackText },
    setup: () => ({ args, text }),
    template: '<TediFeedbackText v-bind="args">{{ text }}</TediFeedbackText>',
  });
};

export const Default: Story = {
  args: { type: 'hint', position: 'left' },
  render: renderWithText('I am a hint text'),
};

export const Error: Story = {
  args: { type: 'error' },
  render: renderWithText('I am an error text'),
};

export const Valid: Story = {
  args: { type: 'valid' },
  render: renderWithText('I am a valid text'),
};

export const PositionLeft: Story = {
  // Renders the same as Default: skip the duplicate snapshot, the quota is shared with react and angular.
  parameters: { chromatic: { disableSnapshot: true } },
  args: { position: 'left' },
  render: renderWithText('I am a hint text'),
};

export const PositionRight: Story = {
  args: { type: 'valid', position: 'right' },
  render: renderWithText('I am a valid text'),
};
