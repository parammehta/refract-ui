import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Icon, icons } from './Icon';
import type { IconName } from './Icon';

describe('Icon', () => {
  it('covers all 21 icon names', () => {
    expect(Object.keys(icons)).toHaveLength(21);
  });

  it('renders every icon in the map without error', () => {
    for (const name of Object.keys(icons) as IconName[]) {
      const { container, unmount } = render(<Icon icon={name} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
      unmount();
    }
  });

  it('is hidden from the accessibility tree', () => {
    const { container } = render(<Icon icon="close" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden');
  });

  it('merges a custom className', () => {
    const { container } = render(<Icon icon="close" className="extra" />);
    expect(container.querySelector('svg')).toHaveClass('extra');
  });

  it('forwards arbitrary props', () => {
    const { container } = render(<Icon icon="close" data-testid="my-icon" />);
    expect(container.querySelector('svg')).toHaveAttribute('data-testid', 'my-icon');
  });
});
