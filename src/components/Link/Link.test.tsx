import { createRef, forwardRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Link } from './Link';
import type { LinkComponentProps } from '../LinkProvider';

describe('Link', () => {
  it('renders its children', () => {
    render(<Link href="/foo">Home</Link>);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders a plain anchor for external links', () => {
    render(<Link href="https://example.com">External</Link>);
    const link = screen.getByRole('link', { name: 'External' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer noopener');
  });

  it('renders a plain anchor for hash links', () => {
    render(<Link href="#section">Section</Link>);
    expect(screen.getByRole('link', { name: 'Section' }).tagName).toBe('A');
  });

  it('renders a plain anchor for file-extension links', () => {
    render(<Link href="/resume.pdf.png">Image</Link>);
    // extension list doesn't include pdf, only txt/png/jpg — png matches
    expect(screen.getByRole('link', { name: 'Image' }).tagName).toBe('A');
  });

  it('does not add target/rel for internal links', () => {
    render(<Link href="/internal">Internal</Link>);
    const link = screen.getByRole('link', { name: 'Internal' });
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });

  it('uses the LinkProvider-supplied component for internal, non-anchor hrefs', () => {
    const CustomLink = forwardRef<HTMLAnchorElement, LinkComponentProps>((props, ref) => (
      <a data-custom-rendered ref={ref} {...props} />
    ));
    CustomLink.displayName = 'CustomLink';

    render(
      <Link href="/internal" linkComponent={CustomLink}>
        Go
      </Link>
    );
    expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('data-custom-rendered');
  });

  it('applies the secondary data attribute', () => {
    render(
      <Link href="/foo" secondary>
        Secondary
      </Link>
    );
    expect(screen.getByRole('link', { name: 'Secondary' })).toHaveAttribute(
      'data-secondary',
      'true'
    );
  });

  it('forwards a ref to the underlying anchor', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Link href="https://example.com" ref={ref}>
        Ref target
      </Link>
    );
    expect(ref.current).toBe(screen.getByRole('link', { name: 'Ref target' }));
  });

  it('merges a custom className', () => {
    render(
      <Link href="https://example.com" className="extra">
        Classed
      </Link>
    );
    expect(screen.getByRole('link', { name: 'Classed' })).toHaveClass('extra');
  });
});
