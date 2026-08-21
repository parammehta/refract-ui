import { forwardRef } from 'react';
import { render, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { RefractProvider, useRefractConfig } from './RefractProvider';
import { useLinkComponent, type LinkComponentProps } from '../LinkProvider';

afterEach(() => {
  document.body.removeAttribute('data-theme');
  document.head.querySelector('meta[name="theme-color"]')?.remove();
  window.localStorage.clear();
});

describe('RefractProvider', () => {
  it('renders its children', () => {
    render(<RefractProvider>Hello</RefractProvider>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('defaults dracoDecoderPath, modelBasePath, and portalContainer', () => {
    const { result } = renderHook(() => useRefractConfig(), {
      wrapper: ({ children }) => <RefractProvider>{children}</RefractProvider>,
    });
    expect(result.current.dracoDecoderPath).toBe('/draco/');
    expect(result.current.modelBasePath).toBe('/models/');
    expect(result.current.portalContainer()).toBeNull();
  });

  it('supplies overridden config values via context', () => {
    const { result } = renderHook(() => useRefractConfig(), {
      wrapper: ({ children }) => (
        <RefractProvider dracoDecoderPath="/custom-draco/" modelBasePath="/custom-models/">
          {children}
        </RefractProvider>
      ),
    });
    expect(result.current.dracoDecoderPath).toBe('/custom-draco/');
    expect(result.current.modelBasePath).toBe('/custom-models/');
  });

  it('applies the given theme id to document.body', () => {
    render(<RefractProvider themeId="light">Content</RefractProvider>);
    expect(document.body.dataset.theme).toBe('light');
  });

  it('supplies a linkComponent to descendants via LinkProvider', () => {
    const CustomLink = forwardRef<HTMLAnchorElement, LinkComponentProps>((props, ref) => (
      <a data-custom-rendered ref={ref} {...props} />
    ));
    CustomLink.displayName = 'CustomLink';

    const { result } = renderHook(() => useLinkComponent(), {
      wrapper: ({ children }) => (
        <RefractProvider linkComponent={CustomLink}>{children}</RefractProvider>
      ),
    });
    const Component = result.current;
    render(<Component href="/foo">Go</Component>);
    expect(screen.getByText('Go')).toHaveAttribute('data-custom-rendered');
  });

  it('falls back to the default link component when none is supplied', () => {
    const { result } = renderHook(() => useLinkComponent(), {
      wrapper: ({ children }) => <RefractProvider>{children}</RefractProvider>,
    });
    const Component = result.current;
    render(<Component href="/foo">Go</Component>);
    expect(screen.getByText('Go')).not.toHaveAttribute('data-custom-rendered');
  });
});
