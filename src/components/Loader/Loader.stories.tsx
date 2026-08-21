import type { Meta, StoryObj } from '@storybook/react-vite';
import { Loader } from '../Loader';
import { StoryContainer } from '../../stories/StoryContainer';

const meta: Meta<typeof Loader> = {
  title: 'Loader',
  component: Loader,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Loader>;

export const Default: Story = {
  render: () => (
    <StoryContainer>
      <Loader size={48} />
    </StoryContainer>
  ),
};
