import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumbs } from '../Breadcrumbs';
import { StoryContainer } from '../../stories/StoryContainer';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const TwoLevel: Story = {
  render: () => (
    <StoryContainer vertical stretch>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Resume', href: '/resume' },
        ]}
      />
    </StoryContainer>
  ),
};

export const ThreeLevel: Story = {
  render: () => (
    <StoryContainer vertical stretch>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Experience', href: '/experience' },
          { label: 'Intuit', href: '/experience/intuit' },
        ]}
      />
    </StoryContainer>
  ),
};

export const InPageHeader: Story = {
  render: () => (
    <StoryContainer vertical stretch>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Resume', href: '/resume' },
        ]}
      />
      <h1>Resume</h1>
      <p>Software engineer with 8+ years building identity, frontend, and AI-native experiences.</p>
    </StoryContainer>
  ),
};
