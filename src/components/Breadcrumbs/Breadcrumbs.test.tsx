import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Breadcrumbs } from './Breadcrumbs';

const items = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Refract UI', href: '/projects/refract-ui' },
];

describe('Breadcrumbs', () => {
  it('renders a nav with an accessible label', () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('renders a link for every item except the last', () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'href',
      '/projects'
    );
    expect(screen.queryByRole('link', { name: 'Refract UI' })).not.toBeInTheDocument();
  });

  it('renders the last item as current page text, not a link', () => {
    render(<Breadcrumbs items={items} />);
    const current = screen.getByText('Refract UI');
    expect(current.tagName).toBe('SPAN');
    expect(current).toHaveAttribute('aria-current', 'page');
  });

  it('renders a separator between items but not before the first', () => {
    const { container } = render(<Breadcrumbs items={items} />);
    // one separator svg per item after the first
    expect(container.querySelectorAll('svg')).toHaveLength(items.length - 1);
  });

  it('renders a single item with no separator and as current page', () => {
    const { container } = render(<Breadcrumbs items={[{ label: 'Only', href: '/only' }]} />);
    expect(container.querySelectorAll('svg')).toHaveLength(0);
    expect(screen.getByText('Only')).toHaveAttribute('aria-current', 'page');
  });

  it('merges a custom className onto the nav', () => {
    render(<Breadcrumbs items={items} className="extra" />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveClass('extra');
  });
});
