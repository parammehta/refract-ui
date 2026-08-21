import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './useTheme';
import { theme } from './theme';

const ThemeReader = () => {
  const currentTheme = useTheme();
  return <span data-testid="rgb-background">{'rgbBackground' in currentTheme ? currentTheme.rgbBackground : ''}</span>;
};

afterEach(() => {
  document.body.removeAttribute('data-theme');
  document.head.querySelector('meta[name="theme-color"]')?.remove();
  window.localStorage.clear();
});

describe('ThemeProvider', () => {
  it('renders its children', () => {
    render(<ThemeProvider>Hello</ThemeProvider>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('as the root provider, renders children with no wrapper element', () => {
    const { container } = render(
      <ThemeProvider>
        <span>Root child</span>
      </ThemeProvider>
    );
    expect(container.querySelector('.theme-provider')).not.toBeInTheDocument();
    expect(screen.getByText('Root child')).toBeInTheDocument();
  });

  it('nested inside another provider, renders a wrapper element with data-theme', () => {
    render(
      <ThemeProvider themeId="dark">
        <ThemeProvider themeId="light">
          <span>Nested child</span>
        </ThemeProvider>
      </ThemeProvider>
    );
    const wrapper = screen.getByText('Nested child').closest('.theme-provider');
    expect(wrapper).toHaveAttribute('data-theme', 'light');
  });

  it('renders the wrapper as a custom element via the `as` prop when nested', () => {
    render(
      <ThemeProvider themeId="dark">
        <ThemeProvider themeId="light" as="section">
          <span>Nested child</span>
        </ThemeProvider>
      </ThemeProvider>
    );
    expect(screen.getByText('Nested child').closest('section')).toBeInTheDocument();
  });

  it('sets document.body.dataset.theme for the root provider', () => {
    render(<ThemeProvider themeId="light">Content</ThemeProvider>);
    expect(document.body.dataset.theme).toBe('light');
  });

  it('persists the theme id to localStorage as the root provider', () => {
    render(<ThemeProvider themeId="dark">Content</ThemeProvider>);
    expect(window.localStorage.getItem('theme')).toBe(JSON.stringify('dark'));
  });

  it('sets the theme-color meta tag by default', () => {
    render(<ThemeProvider themeId="dark">Content</ThemeProvider>);
    const meta = document.head.querySelector('meta[name="theme-color"]');
    expect(meta).toHaveAttribute('content', `rgb(${theme.dark.rgbBackground})`);
  });

  it('skips the theme-color meta tag when themeColor is false', () => {
    render(
      <ThemeProvider themeId="dark" themeColor={false}>
        Content
      </ThemeProvider>
    );
    expect(document.head.querySelector('meta[name="theme-color"]')).not.toBeInTheDocument();
  });

  it('provides theme tokens to descendants via context', () => {
    render(
      <ThemeProvider themeId="dark">
        <ThemeReader />
      </ThemeProvider>
    );
    expect(screen.getByTestId('rgb-background')).toHaveTextContent(theme.dark.rgbBackground);
  });

  it('merges theme overrides on top of the base theme', () => {
    render(
      <ThemeProvider themeId="dark" theme={{ rgbBackground: '1 2 3' }}>
        <ThemeReader />
      </ThemeProvider>
    );
    expect(screen.getByTestId('rgb-background')).toHaveTextContent('1 2 3');
  });
});
