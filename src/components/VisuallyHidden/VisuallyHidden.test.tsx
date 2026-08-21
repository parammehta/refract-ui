import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VisuallyHidden } from './VisuallyHidden';

describe('VisuallyHidden', () => {
  it('renders its children', () => {
    render(<VisuallyHidden>Hidden text</VisuallyHidden>);
    expect(screen.getByText('Hidden text')).toBeInTheDocument();
  });

  it('renders as a span by default', () => {
    render(<VisuallyHidden>Default</VisuallyHidden>);
    expect(screen.getByText('Default').tagName).toBe('SPAN');
  });

  it('renders as a custom element via the `as` prop', () => {
    render(<VisuallyHidden as="a" href="/foo">Link text</VisuallyHidden>);
    expect(screen.getByText('Link text').tagName).toBe('A');
  });

  it('sets data-hidden true when not visible and not showOnFocus', () => {
    render(<VisuallyHidden>Content</VisuallyHidden>);
    expect(screen.getByText('Content')).toHaveAttribute('data-hidden', 'true');
  });

  it('sets data-hidden false when visible', () => {
    render(<VisuallyHidden visible>Content</VisuallyHidden>);
    expect(screen.getByText('Content')).toHaveAttribute('data-hidden', 'false');
  });

  it('sets data-hidden false when showOnFocus is true', () => {
    render(<VisuallyHidden showOnFocus>Content</VisuallyHidden>);
    expect(screen.getByText('Content')).toHaveAttribute('data-hidden', 'false');
  });

  it('sets data-show-on-focus from the prop', () => {
    render(<VisuallyHidden showOnFocus>Content</VisuallyHidden>);
    expect(screen.getByText('Content')).toHaveAttribute('data-show-on-focus', 'true');
  });

  it('forwards a ref to the underlying element', () => {
    const ref = createRef<HTMLElement>();
    render(<VisuallyHidden ref={ref}>Ref target</VisuallyHidden>);
    expect(ref.current).toBe(screen.getByText('Ref target'));
  });

  it('merges a custom className', () => {
    render(<VisuallyHidden className="extra">Classed</VisuallyHidden>);
    expect(screen.getByText('Classed')).toHaveClass('extra');
  });
});
