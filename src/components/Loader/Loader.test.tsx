import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { useReducedMotion } from 'framer-motion';
import { Loader } from './Loader';

vi.mock('framer-motion', async importOriginal => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return { ...actual, useReducedMotion: vi.fn() };
});

afterEach(() => {
  vi.mocked(useReducedMotion).mockReset();
  document.getElementById('portal-root')?.remove();
});

describe('Loader', () => {
  it('renders the loading text when motion is reduced', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    render(<Loader text="Fetching results" />);
    expect(screen.getByText('Fetching results')).toBeInTheDocument();
  });

  it('defaults the loading text', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    render(<Loader />);
    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);
  });

  it('renders three animated bars when motion is not reduced', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    const { container } = render(<Loader />);
    // root div > content div > three bar divs
    expect(container.querySelectorAll('div')).toHaveLength(5);
    expect(container.querySelectorAll('span')).toHaveLength(0);
  });

  it('renders as plain text (a span) when reduced motion is preferred', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { container } = render(<Loader text="Reduced" />);
    expect(container.querySelectorAll('div')).toHaveLength(0);
    expect(screen.getByText('Reduced').tagName).toBe('SPAN');
  });

  it('sets size-derived CSS custom properties', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    const { container } = render(<Loader size={60} />);
    const root = container.firstChild as HTMLElement;
    expect(root.style.getPropertyValue('--size')).toBe('60px');
  });

  it('portals a screen-reader announcement into #portal-root when present', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    const portalRoot = document.createElement('div');
    portalRoot.id = 'portal-root';
    document.body.appendChild(portalRoot);

    render(<Loader text="Announced" />);
    expect(portalRoot).toHaveTextContent('Announced');
  });

  it('does not throw when there is no #portal-root', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    expect(() => render(<Loader text="No portal" />)).not.toThrow();
  });

  it('merges a custom className', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    const { container } = render(<Loader className="extra" />);
    expect(container.firstChild).toHaveClass('extra');
  });
});
