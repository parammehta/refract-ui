import { createRef, forwardRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';
import type { LinkComponentProps } from '../LinkProvider';

describe('Button', () => {
  it('renders as a button by default', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button.tagName).toBe('BUTTON');
  });

  it('renders as an anchor when href is provided', () => {
    render(<Button href="/about">About</Button>);
    const link = screen.getByRole('link', { name: 'About' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/about');
  });

  it('adds target and rel for external links', () => {
    render(<Button href="https://example.com">External</Button>);
    const link = screen.getByRole('link', { name: 'External' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not add target/rel for internal links', () => {
    render(<Button href="/internal">Internal</Button>);
    const link = screen.getByRole('link', { name: 'Internal' });
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });

  it('fires onClick handlers', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Click me' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when the disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
  });

  it('applies the secondary data attribute', () => {
    render(<Button secondary>Secondary</Button>);
    expect(screen.getByRole('button', { name: 'Secondary' })).toHaveAttribute(
      'data-secondary',
      'true'
    );
  });

  it('renders an icon when the icon prop is set', () => {
    const { container } = render(<Button icon="close">With icon</Button>);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies the data-loading attribute when loading', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button', { name: 'Loading' })).toHaveAttribute(
      'data-loading',
      'true'
    );
  });

  it('renders as a custom element via the `as` prop', () => {
    render(
      <Button as="div" role="button">
        Custom
      </Button>
    );
    expect(screen.getByRole('button', { name: 'Custom' }).tagName).toBe('DIV');
  });

  it('forwards a ref to the underlying element', () => {
    const ref = createRef<HTMLElement>();
    render(<Button ref={ref}>Ref target</Button>);
    expect(ref.current).toBe(screen.getByRole('button', { name: 'Ref target' }));
  });

  it('uses a custom linkComponent override for internal hrefs', () => {
    const CustomLink = forwardRef<HTMLAnchorElement, LinkComponentProps>((props, ref) => (
      <a data-custom-rendered ref={ref} {...props} />
    ));
    CustomLink.displayName = 'CustomLink';

    render(
      <Button href="/internal" linkComponent={CustomLink}>
        Go
      </Button>
    );
    expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('data-custom-rendered');
  });
});
