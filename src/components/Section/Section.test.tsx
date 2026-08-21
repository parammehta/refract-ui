import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Section } from './Section';

describe('Section', () => {
  it('renders its children', () => {
    render(<Section>Hello world</Section>);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders as a div by default', () => {
    render(<Section>Default</Section>);
    expect(screen.getByText('Default').tagName).toBe('DIV');
  });

  it('renders as a custom element via the `as` prop', () => {
    render(<Section as="section">Custom</Section>);
    expect(screen.getByText('Custom').tagName).toBe('SECTION');
  });

  it('forwards a ref to the underlying element', () => {
    const ref = createRef<HTMLElement>();
    render(<Section ref={ref}>Ref target</Section>);
    expect(ref.current).toBe(screen.getByText('Ref target'));
  });

  it('forwards arbitrary props', () => {
    render(<Section aria-label="labelled">Content</Section>);
    expect(screen.getByLabelText('labelled')).toBeInTheDocument();
  });

  it('merges a custom className', () => {
    render(<Section className="extra">Classed</Section>);
    expect(screen.getByText('Classed')).toHaveClass('extra');
  });
});
