import { createRef } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Wordmark } from './Wordmark';

describe('Wordmark', () => {
  it('renders an svg with the expected dimensions', () => {
    const { container } = render(<Wordmark />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '46');
    expect(svg).toHaveAttribute('height', '29');
  });

  it('is hidden from the accessibility tree', () => {
    const { container } = render(<Wordmark />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden');
  });

  it('does not render a highlight rect by default', () => {
    const { container } = render(<Wordmark />);
    // one rect for the base fill only
    expect(container.querySelectorAll('rect')).toHaveLength(1);
  });

  it('renders an extra highlight rect when highlight is true', () => {
    const { container } = render(<Wordmark highlight />);
    expect(container.querySelectorAll('rect')).toHaveLength(2);
  });

  it('forwards a ref to the svg element', () => {
    const ref = createRef<SVGSVGElement>();
    const { container } = render(<Wordmark ref={ref} />);
    expect(ref.current).toBe(container.querySelector('svg'));
  });

  it('merges a custom className', () => {
    const { container } = render(<Wordmark className="extra" />);
    expect(container.querySelector('svg')).toHaveClass('extra');
  });

  it('forwards arbitrary props', () => {
    const { container } = render(<Wordmark data-testid="mark" />);
    expect(container.querySelector('svg')).toHaveAttribute('data-testid', 'mark');
  });
});
