import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Heading } from './Heading';

describe('Heading', () => {
  it('renders its children', () => {
    render(<Heading>Hello world</Heading>);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders as h1 by default', () => {
    render(<Heading>Default</Heading>);
    expect(screen.getByText('Default').tagName).toBe('H1');
  });

  it('renders the tag matching the level prop', () => {
    render(<Heading level={3}>Level three</Heading>);
    expect(screen.getByText('Level three').tagName).toBe('H3');
  });

  it('clamps level to a minimum of 1', () => {
    render(<Heading level={0}>Clamped low</Heading>);
    const el = screen.getByText('Clamped low');
    expect(el.tagName).toBe('H1');
    expect(el).toHaveAttribute('data-level', '0');
  });

  it('clamps level to a maximum of 5', () => {
    render(<Heading level={10}>Clamped high</Heading>);
    const el = screen.getByText('Clamped high');
    expect(el.tagName).toBe('H5');
    expect(el).toHaveAttribute('data-level', '5');
  });

  it('renders as a custom element via the `as` prop, overriding level', () => {
    render(
      <Heading level={2} as="div">
        Custom element
      </Heading>
    );
    expect(screen.getByText('Custom element').tagName).toBe('DIV');
  });

  it('applies align and weight as data attributes', () => {
    render(
      <Heading align="center" weight="bold">
        Styled
      </Heading>
    );
    const el = screen.getByText('Styled');
    expect(el).toHaveAttribute('data-align', 'center');
    expect(el).toHaveAttribute('data-weight', 'bold');
  });

  it('defaults align to auto and weight to medium', () => {
    render(<Heading>Defaults</Heading>);
    const el = screen.getByText('Defaults');
    expect(el).toHaveAttribute('data-align', 'auto');
    expect(el).toHaveAttribute('data-weight', 'medium');
  });

  it('forwards arbitrary props', () => {
    render(<Heading aria-label="labelled">Content</Heading>);
    expect(screen.getByLabelText('labelled')).toBeInTheDocument();
  });
});
