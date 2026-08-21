import { createContext, useContext, type ReactNode } from 'react';
import { LinkProvider, type LinkComponent } from '../LinkProvider';
import { ThemeProvider, type ThemeId } from '../ThemeProvider';
import type { ThemeTokens } from '../ThemeProvider';

export interface RefractConfig {
  /** Path the draco decoder assets are served from. Defaults to '/draco/'. */
  dracoDecoderPath?: string;
  /** Path device .glb models are served from. Defaults to '/models/'. */
  modelBasePath?: string;
  /** Container the Loader's screen-reader announcement portals into. Defaults to #portal-root. */
  portalContainer?: () => HTMLElement | null;
}

const defaultConfig: Required<RefractConfig> = {
  dracoDecoderPath: '/draco/',
  modelBasePath: '/models/',
  portalContainer: () => document.getElementById('portal-root'),
};

const RefractConfigContext = createContext<Required<RefractConfig>>(defaultConfig);

export const useRefractConfig = (): Required<RefractConfig> => useContext(RefractConfigContext);

export interface RefractProviderProps extends RefractConfig {
  linkComponent?: LinkComponent;
  themeId?: ThemeId;
  theme?: Partial<ThemeTokens>;
  themeColor?: boolean;
  children?: ReactNode;
}

// Convenience composition of ThemeProvider + LinkProvider + the asset-path
// config the 3D components need. Each piece stays independently exported and
// usable on its own — nothing here is required.
export const RefractProvider = ({
  linkComponent,
  themeId,
  theme,
  themeColor,
  dracoDecoderPath = defaultConfig.dracoDecoderPath,
  modelBasePath = defaultConfig.modelBasePath,
  portalContainer = defaultConfig.portalContainer,
  children,
}: RefractProviderProps) => (
  <RefractConfigContext.Provider value={{ dracoDecoderPath, modelBasePath, portalContainer }}>
    <ThemeProvider themeId={themeId} theme={theme} themeColor={themeColor}>
      {linkComponent ? (
        <LinkProvider component={linkComponent}>{children}</LinkProvider>
      ) : (
        children
      )}
    </ThemeProvider>
  </RefractConfigContext.Provider>
);
