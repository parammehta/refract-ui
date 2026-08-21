import type { CSSProperties } from 'react';
import { theme, tokens } from '../components/ThemeProvider/theme';

const border = '1px solid rgba(128, 128, 128, 0.3)';

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 14,
  lineHeight: 1.5,
  textAlign: 'left',
  margin: '16px 0 24px',
};

const thStyle: CSSProperties = {
  borderBottom: border,
  padding: '8px 12px 8px 0',
  fontWeight: 600,
  opacity: 0.7,
};

const tdStyle: CSSProperties = {
  borderBottom: border,
  padding: '8px 12px 8px 0',
  verticalAlign: 'middle',
};

const nameStyle: CSSProperties = {
  ...tdStyle,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  whiteSpace: 'nowrap',
};

const valueStyle: CSSProperties = {
  ...tdStyle,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  opacity: 0.75,
  wordBreak: 'break-word',
};

/** `rgbBackground: '17 17 17'` is a bare channel triplet — only those can be painted. */
function swatchColor(value: string): string | null {
  return /^\d+ \d+ \d+$/.test(value) ? `rgb(${value})` : null;
}

function Swatch({ value }: { value: string }) {
  const color = swatchColor(value);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {color && (
        <span
          style={{
            width: 20,
            height: 20,
            flexShrink: 0,
            borderRadius: 4,
            background: color,
            border,
          }}
        />
      )}
      <code style={{ opacity: 0.75 }}>{value}</code>
    </span>
  );
}

/** Theme tokens, dark and light side by side. */
export const ColorSwatches = () => {
  const keys = Object.keys(theme.dark).filter(key => key !== 'themeId') as Array<
    keyof typeof theme.dark
  >;

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Token</th>
          <th style={thStyle}>Dark</th>
          <th style={thStyle}>Light</th>
        </tr>
      </thead>
      <tbody>
        {keys.map(key => (
          <tr key={key}>
            <td style={nameStyle}>--{key}</td>
            <td style={tdStyle}>
              <Swatch value={theme.dark[key]} />
            </td>
            <td style={tdStyle}>
              <Swatch value={theme.light[key]} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

type TokenGroup = 'fontSize' | 'fontStack' | 'fontWeight' | 'space' | 'maxWidth' | 'duration' | 'lineHeight' | 'zIndex';

const groupMatchers: Record<TokenGroup, (key: string) => boolean> = {
  fontSize: key => key.startsWith('fontSize'),
  fontStack: key => key.endsWith('FontStack') || key === 'fontStack',
  fontWeight: key => key.startsWith('fontWeight'),
  space: key => key.startsWith('space'),
  maxWidth: key => key.startsWith('maxWidth'),
  duration: key => key.startsWith('duration') || key.startsWith('bezier'),
  lineHeight: key => key.startsWith('lineHeight'),
  zIndex: key => key.startsWith('zIndex'),
};

/** Name/value table for one slice of `tokens.base`, derived from the source object. */
export const TokenTable = ({ group }: { group: TokenGroup }) => {
  const entries = Object.entries(tokens.base).filter(([key]) => groupMatchers[group](key));

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Token</th>
          <th style={thStyle}>Value</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(([key, value]) => (
          <tr key={key}>
            <td style={nameStyle}>--{key}</td>
            <td style={valueStyle}>{String(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const breakpointLabels: Record<string, string> = {
  desktop: 'max-width: 2080px',
  laptop: 'max-width: 1680px',
  tablet: 'max-width: 1040px',
  mobile: 'max-width: 696px',
  mobileS: 'max-width: 400px',
};

/** The per-breakpoint overrides `tokenStyles` emits as `@media` blocks. */
export const ResponsiveTokens = () => {
  const groups = Object.entries(tokens).filter(([key]) => key !== 'base');

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Breakpoint</th>
          <th style={thStyle}>Overrides</th>
        </tr>
      </thead>
      <tbody>
        {groups.map(([name, group]) => (
          <tr key={name}>
            <td style={nameStyle}>
              {name}
              <div style={{ opacity: 0.5, fontSize: 12 }}>{breakpointLabels[name]}</div>
            </td>
            <td style={valueStyle}>
              {Object.entries(group as Record<string, string | number>)
                .map(([key, value]) => `--${key}: ${value}`)
                .join('; ')}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
