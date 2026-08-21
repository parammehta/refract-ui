import { forwardRef } from 'react';
import { render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LinkProvider, useLinkComponent, type LinkComponentProps } from './LinkProvider';

const CustomLink = forwardRef<HTMLAnchorElement, LinkComponentProps>((props, ref) => (
  <a data-custom-link ref={ref} {...props} />
));
CustomLink.displayName = 'CustomLink';

describe('LinkProvider', () => {
  it('defaults useLinkComponent to a plain anchor with no provider', () => {
    const { result } = renderHook(() => useLinkComponent());
    const Component = result.current;
    render(<Component href="/foo">Home</Component>);
    const link = screen.getByText('Home');
    expect(link.tagName).toBe('A');
    expect(link).not.toHaveAttribute('data-custom-link');
  });

  it('supplies the given component to consumers via context', () => {
    const { result } = renderHook(() => useLinkComponent(), {
      wrapper: ({ children }) => <LinkProvider component={CustomLink}>{children}</LinkProvider>,
    });
    const Component = result.current;
    render(<Component href="/foo">Home</Component>);
    expect(screen.getByText('Home')).toHaveAttribute('data-custom-link');
  });

  it('renders children', () => {
    render(
      <LinkProvider component={CustomLink}>
        <span>Child content</span>
      </LinkProvider>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });
});
