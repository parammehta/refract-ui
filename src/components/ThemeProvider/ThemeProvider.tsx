import { useHasMounted } from '../../hooks/useHasMounted';
import { createContext, useEffect, type ElementType, type ReactNode } from 'react';
import { classes, media } from '../../utils/style';
import { theme, tokens, type ThemeTokens } from './theme';
import { useTheme } from './useTheme';

export type ThemeId = 'dark' | 'light';

export const ThemeContext = createContext<ThemeTokens | Record<string, never>>({});

interface ThemeProviderProps {
  themeId?: ThemeId;
  theme?: Partial<ThemeTokens>;
  children?: ReactNode;
  className?: string;
  as?: ElementType;
  /** Keep the `<meta name="theme-color">` tag in sync with the theme. Defaults to true. */
  themeColor?: boolean;
  [key: string]: unknown;
}

export const ThemeProvider = ({
  themeId = 'dark',
  theme: themeOverrides,
  children,
  className,
  as: Component = 'div',
  themeColor = true,
  ...rest
}: ThemeProviderProps) => {
  const currentTheme = { ...theme[themeId], ...themeOverrides };
  const parentTheme = useTheme();
  const isRootProvider = !parentTheme.themeId;
  const hasMounted = useHasMounted();

  useEffect(() => {
    if (!isRootProvider || !hasMounted) return;

    window.localStorage.setItem('theme', JSON.stringify(themeId));
    document.body.dataset.theme = themeId;

    if (!themeColor) return;

    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }

    meta.content = `rgb(${currentTheme.rgbBackground})`;
  }, [themeId, isRootProvider, hasMounted, themeColor, currentTheme.rgbBackground]);

  return (
    <ThemeContext.Provider value={currentTheme}>
      {isRootProvider && children}
      {!isRootProvider && (
        <Component
          className={classes('theme-provider', className)}
          data-theme={themeId}
          {...rest}
        >
          {children}
        </Component>
      )}
    </ThemeContext.Provider>
  );
};

export function squish(styles: string): string {
  return styles.replace(/\s\s+/g, ' ');
}

export function createThemeProperties(themeObj: Record<string, string | number>): string {
  return squish(
    Object.keys(themeObj)
      .filter(key => key !== 'themeId')
      .map(key => `--${key}: ${themeObj[key]};`)
      .join('\n\n')
  );
}

export function createThemeStyleObject(themeObj: Record<string, string | number>): Record<string, string | number> {
  const style: Record<string, string | number> = {};

  for (const key of Object.keys(themeObj)) {
    if (key !== 'themeId') {
      style[`--${key}`] = themeObj[key];
    }
  }

  return style;
}

export function createMediaTokenProperties(): string {
  return squish(
    (Object.keys(media) as Array<keyof typeof media>)
      .map(key => {
        return `
        @media (max-width: ${media[key]}px) {
          :root {
            ${createThemeProperties(tokens[key] as unknown as Record<string, string | number>)}
          }
        }
      `;
      })
      .join('\n')
  );
}

export const tokenStyles = squish(`
  :root {
    ${createThemeProperties(tokens.base as unknown as Record<string, string | number>)}
  }

  ${createMediaTokenProperties()}

  [data-theme='dark'] {
    ${createThemeProperties(theme.dark)}
  }

  [data-theme='light'] {
    ${createThemeProperties(theme.light)}
  }
`);
