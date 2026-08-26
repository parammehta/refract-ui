import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ScrollTimeline, type ScrollTimelineItem } from './ScrollTimeline';

const items: ScrollTimelineItem[] = [
  { id: 'a', group: '2024', label: 'Staff Engineer' },
  { id: 'b', group: '2022', label: 'Senior Engineer' },
  { id: 'c', group: '2022', label: 'Engineer' },
];

const renderTimeline = (props: Partial<Parameters<typeof ScrollTimeline>[0]> = {}) =>
  render(
    <ScrollTimeline
      items={items}
      label="Career"
      renderItem={item => <span>{item.label} card</span>}
      {...props}
    />
  );

describe('ScrollTimeline', () => {
  it('renders a labelled region', () => {
    renderTimeline();
    expect(screen.getByRole('region', { name: 'Career' })).toBeInTheDocument();
  });

  it('renders a button per item, named by its label', () => {
    renderTimeline();
    expect(screen.getAllByRole('button').map(b => b.getAttribute('aria-label'))).toEqual([
      'Staff Engineer',
      'Senior Engineer',
      'Engineer',
    ]);
  });

  it('renders card content through renderItem', () => {
    renderTimeline();
    expect(screen.getByText('Staff Engineer card')).toBeInTheDocument();
  });

  it('renders a group heading only when the group changes', () => {
    renderTimeline();
    // '2022' spans the last two items, so it heads a band rather than
    // repeating — that collapsing is the whole point of `group`.
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getAllByText('2022')).toHaveLength(1);
  });

  it('alternates which side of the axis each card sits on', () => {
    const { container } = renderTimeline();
    const sides = Array.from(container.querySelectorAll('[data-side]')).map(node =>
      node.getAttribute('data-side')
    );
    expect(sides).toEqual(['above', 'below', 'above']);
  });

  it('starts the alternation on the requested side', () => {
    const { container } = renderTimeline({ startSide: 'below' });
    const sides = Array.from(container.querySelectorAll('[data-side]')).map(node =>
      node.getAttribute('data-side')
    );
    expect(sides).toEqual(['below', 'above', 'below']);
  });

  it('gives only the active item a tab stop', () => {
    renderTimeline();
    // A roving tabindex: tabbing onto every card would scroll a full runway
    // length per press, so the timeline is a single stop.
    expect(screen.getAllByRole('button').map(b => b.getAttribute('tabindex'))).toEqual([
      '0',
      '-1',
      '-1',
    ]);
  });

  it('reports the active item on mount', () => {
    const onActiveChange = vi.fn();
    renderTimeline({ onActiveChange });
    expect(onActiveChange).toHaveBeenCalledWith(items[0], 0);
  });

  it('moves the active item when a card takes focus', () => {
    const onActiveChange = vi.fn();
    renderTimeline({ onActiveChange });
    fireEvent.focus(screen.getAllByRole('button')[1]);
    expect(onActiveChange).toHaveBeenLastCalledWith(items[1], 1);
    expect(screen.getAllByRole('button')[1]).toHaveAttribute('aria-current', 'true');
  });

  it('scales the runway with the number of items', () => {
    const { container } = renderTimeline({ scrollRatio: 2 });
    expect(container.firstElementChild).toHaveStyle({ '--runway': '6' });
  });

  it('renders nothing when there are no items', () => {
    const { container } = renderTimeline({ items: [] });
    expect(container).toBeEmptyDOMElement();
  });
});
