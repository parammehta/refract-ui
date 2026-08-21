import type { Meta, StoryObj } from '@storybook/react-vite';
import { Wordmark } from '../Wordmark';
import { StoryContainer } from '../../stories/StoryContainer';

const meta: Meta<typeof Wordmark> = {
  title: 'Wordmark',
  component: Wordmark,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Wordmark>;

export const Default: Story = {
  render: () => (
    <StoryContainer>
      <Wordmark highlight />
    </StoryContainer>
  ),
};

export const NoHighlight: Story = {
  render: () => (
    <StoryContainer>
      <Wordmark />
    </StoryContainer>
  ),
};
