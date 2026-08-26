import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef } from 'react';
import { ScrollTimeline, type ScrollTimelineItem } from '../ScrollTimeline';
import { Text } from '../Text';

const meta: Meta<typeof ScrollTimeline> = {
  title: 'ScrollTimeline',
  component: ScrollTimeline,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof ScrollTimeline>;

interface Milestone extends ScrollTimelineItem {
  dates: string;
  detail: string;
}

const items: Milestone[] = [
  { id: '1', group: '2024', label: 'Staff Engineer', dates: '2024 — Present', detail: 'Identity and authentication experiences.', accent: '#7d6bff' },
  { id: '2', group: '2022', label: 'Senior Engineer', dates: '2022 — 2024', detail: 'Design systems at scale.', accent: '#7d6bff' },
  { id: '3', group: '2022', label: 'Senior Engineer', dates: '2022 — 2022', detail: 'Fleet management platform.', accent: '#3ec4a5' },
  { id: '4', group: '2021', label: 'Senior Engineer', dates: '2021 — 2022', detail: 'Marketplace and user-generated content.', accent: '#f2b134' },
  { id: '5', group: '2020', label: 'Engineer', dates: '2020 — 2021', detail: 'Shared component library.', accent: '#f2b134' },
  { id: '6', group: '2018', label: 'Engineer', dates: '2018 — 2020', detail: 'Registry and wireless verticals.', accent: '#f2b134' },
];

/**
 * The timeline reserves a tall runway and sticks its viewport to the top, so it
 * needs a real scrolling ancestor to demonstrate. This story supplies one
 * rather than relying on the Storybook canvas, which is what a consuming page
 * with its own scroll container has to do too.
 */
const Story = ({ startSide }: { startSide?: 'above' | 'below' } = {}) => {
  const container = useRef<HTMLDivElement>(null);

  return (
    <div ref={container} style={{ height: '100vh', overflowY: 'auto' }}>
      <div style={{ height: '100vh', display: 'grid', placeItems: 'center' }}>
        <Text secondary>Scroll down</Text>
      </div>
      <ScrollTimeline
        startSide={startSide}
        items={items}
        scrollContainerRef={container}
        label="Career milestones"
        renderItem={item => {
          const milestone = item as Milestone;
          return (
            <div
              style={{
                width: 260,
                padding: 24,
                borderRadius: 8,
                background: 'rgb(var(--rgbText) / 0.04)',
                border: '1px solid rgb(var(--rgbText) / 0.12)',
              }}
            >
              <Text size="s" secondary as="p" style={{ margin: 0 }}>
                {milestone.dates}
              </Text>
              <Text size="l" as="p" style={{ margin: '8px 0' }}>
                {milestone.label}
              </Text>
              <Text size="s" secondary as="p" style={{ margin: 0 }}>
                {milestone.detail}
              </Text>
            </div>
          );
        }}
      />
      <div style={{ height: '100vh', display: 'grid', placeItems: 'center' }}>
        <Text secondary>After the timeline</Text>
      </div>
    </div>
  );
};

export const Default: Story = { render: Story };

/**
 * `startSide` flips which side the alternation begins on. The alternation is a
 * layout device and means nothing by itself — but when the items carry an order
 * a reader will project onto the vertical axis, it decides which of an adjacent
 * pair sits on top.
 */
export const StartBelow: Story = {
  render: () => <Story startSide="below" />,
};
