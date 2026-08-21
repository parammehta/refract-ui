import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from '../Heading';
import { Section } from '../Section';
import { Text } from '../Text';
import { StoryContainer } from '../../stories/StoryContainer';

const meta = {
  title: 'Section',
  component: Section,
  tags: ['autodocs'],
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <StoryContainer vertical stretch>
      <Section>
        <Heading level={2}>Section heading</Heading>
        <Text>This content lives inside a Section layout primitive.</Text>
      </Section>
    </StoryContainer>
  ),
};

export const AsArticle: Story = {
  render: () => (
    <StoryContainer vertical stretch>
      <Section as="article">
        <Heading level={2}>Article section</Heading>
        <Text>Rendered as an &lt;article&gt; element via the as prop.</Text>
      </Section>
    </StoryContainer>
  ),
};
