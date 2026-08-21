import type { Meta, StoryObj } from '@storybook/react-vite';
import img1 from '../../stories/fixtures/gamestack-list.jpg';
import img1Large from '../../stories/fixtures/gamestack-list-large.jpg';
import img1Placeholder from '../../stories/fixtures/gamestack-list-placeholder.jpg';
import img2 from '../../stories/fixtures/gamestack-login.jpg';
import img2Large from '../../stories/fixtures/gamestack-login-large.jpg';
import img3 from '../../stories/fixtures/rivian-fleet-os-1.png';
import { Carousel } from '../Carousel';
import { StoryContainer } from '../../stories/StoryContainer';

const meta: Meta<typeof Carousel> = {
  title: 'Carousel',
  component: Carousel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Carousel>;

export const Images: Story = {
  render: () => (
    <StoryContainer>
      <Carousel
        style={{ maxWidth: 800, width: '100%' }}
        placeholder={{ src: img1Placeholder }}
        images={[
          {
            src: { src: img1 },
            srcSet: [
              { src: img1, width: 400 },
              { src: img1Large, width: 1200 },
            ],
            alt: 'GameStack game list',
          },
          {
            src: { src: img2 },
            srcSet: [
              { src: img2, width: 400 },
              { src: img2Large, width: 1200 },
            ],
            alt: 'GameStack login screen',
          },
          {
            src: { src: img3 },
            srcSet: [{ src: img3, width: 1200 }],
            alt: 'Rivian Fleet OS interface',
          },
        ]}
        width={1920}
        height={1080}
      />
    </StoryContainer>
  ),
};
