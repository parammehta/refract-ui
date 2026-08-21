import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button';
import { Text } from '../Text';
import { Transition } from '../Transition';
import { StoryContainer } from '../../stories/StoryContainer';

const meta: Meta<typeof Transition> = {
  title: 'Transition',
  component: Transition,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Transition>;

const TransitionDemo = ({ timeout }: { timeout: number }) => {
  const [visible, setVisible] = useState(true);
  return (
    <StoryContainer vertical>
      <Button onClick={() => setVisible(v => !v)}>
        {visible ? 'Hide' : 'Show'}
      </Button>
      <Transition in={visible} timeout={timeout} unmount>
        {(status: boolean) => (
          <Text
            style={{
              opacity: status ? 1 : 0,
              transition: `opacity ${timeout}ms ease`,
            }}
          >
            I fade in and out. Status: {status ? 'visible' : 'hidden'}
          </Text>
        )}
      </Transition>
    </StoryContainer>
  );
};

export const Default: Story = {
  render: () => <TransitionDemo timeout={300} />,
};

export const SlowTimeout: Story = {
  render: () => <TransitionDemo timeout={800} />,
};
