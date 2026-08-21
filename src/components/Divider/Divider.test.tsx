import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Divider } from './Divider';

describe('Divider', () => {
  it('renders a line and a notch by default', () => {
    const { container } = render(<Divider />);
    expect(container.querySelectorAll('div')).toHaveLength(3);
  });

  it('omits the notch when notch is false', () => {
    const { container } = render(<Divider notch={false} />);
    expect(container.querySelectorAll('div')).toHaveLength(2);
  });

  it('applies the light data attribute', () => {
    const { container } = render(<Divider light />);
    expect(container.firstChild).toHaveAttribute('data-light', 'true');
  });

  it('defaults light to false', () => {
    const { container } = render(<Divider />);
    expect(container.firstChild).toHaveAttribute('data-light', 'false');
  });

  it('applies collapsed data attribute to the line and notch', () => {
    const { container } = render(<Divider collapsed />);
    const [line, notch] = container.querySelectorAll('[data-collapsed]');
    expect(line).toHaveAttribute('data-collapsed', 'true');
    expect(notch).toHaveAttribute('data-collapsed', 'true');
  });

  it('sets custom CSS properties from width/height props', () => {
    const { container } = render(<Divider lineWidth="50%" lineHeight="4px" />);
    const root = container.firstChild as HTMLElement;
    expect(root.style.getPropertyValue('--lineWidth')).toBe('50%');
    expect(root.style.getPropertyValue('--lineHeight')).toBe('4px');
  });

  it('merges a custom className', () => {
    const { container } = render(<Divider className="extra" />);
    expect(container.firstChild).toHaveClass('extra');
  });

  it('forwards arbitrary props', () => {
    const { container } = render(<Divider aria-label="labelled" />);
    expect(container.firstChild).toHaveAttribute('aria-label', 'labelled');
  });
});
