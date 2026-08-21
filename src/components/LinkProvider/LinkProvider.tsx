import { createContext, forwardRef, useContext } from 'react';
import type {
  AnchorHTMLAttributes,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from 'react';

export type LinkComponentProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type LinkComponent = ForwardRefExoticComponent<
  LinkComponentProps & RefAttributes<HTMLAnchorElement>
>;

const DefaultLink = forwardRef<HTMLAnchorElement, LinkComponentProps>((props, ref) => (
  <a {...props} ref={ref} />
));

DefaultLink.displayName = 'DefaultLink';

const LinkComponentContext = createContext<LinkComponent>(DefaultLink);

export interface LinkProviderProps {
  component: LinkComponent;
  children?: ReactNode;
}

// Lets a host app (e.g. Next.js) supply its own routed link component —
// Link and Button render it in place of a plain <a> for internal hrefs.
// Defaults to <a> so the components work standalone with no provider.
export const LinkProvider = ({ component, children }: LinkProviderProps) => (
  <LinkComponentContext.Provider value={component}>{children}</LinkComponentContext.Provider>
);

export const useLinkComponent = (): LinkComponent => useContext(LinkComponentContext);
