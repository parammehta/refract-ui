import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { useReducedMotion } from 'framer-motion';
import { ScrambleReveal } from './ScrambleReveal';

vi.mock('framer-motion', async importOriginal => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return { ...actual, useReducedMotion: vi.fn() };
});

afterEach(() => {
  vi.mocked(useReducedMotion).mockReset();
});

describe('ScrambleReveal', () => {
  it('renders the full text for screen readers via VisuallyHidden', () => {
    render(<ScrambleReveal text="Hello world" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders the plain final text immediately when motion is reduced', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { container } = render(<ScrambleReveal text="Reduced motion" />);
    const content = container.querySelector('span[aria-hidden]');
    expect(content).toHaveTextContent('Reduced motion');
  });

  it('marks the visible content span as aria-hidden', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { container } = render(<ScrambleReveal text="Hidden from AT" />);
    expect(container.querySelector('span[aria-hidden]')).toBeInTheDocument();
  });

  it('merges a custom className onto the root span', () => {
    const { container } = render(<ScrambleReveal text="Classed" className="extra" />);
    expect(container.firstChild).toHaveClass('extra');
  });

  it('forwards arbitrary props to the root span', () => {
    render(<ScrambleReveal text="Labelled" data-testid="scramble" />);
    expect(screen.getByTestId('scramble')).toBeInTheDocument();
  });
});
