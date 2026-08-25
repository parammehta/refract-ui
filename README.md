# refract-ui

Themeable React component library — extracted from [parammehta.com](https://parammehta.com).
Primitives, form controls, and a couple of Three.js pieces (device models, a
displacement carousel), with no Next.js or portfolio-specific coupling.

Storybook: https://storybook.parammehta.com — start on the Introduction and Theming pages
for an overview and the token reference.

## Components

Text, Heading, Section, List, Divider, Table, VisuallyHidden, Transition, Loader, Icon,
SegmentedControl, Input, TextArea, Button, Link, Breadcrumbs, ScrambleReveal, ScrollTimeline,
Image, Wordmark, ThemeProvider, LinkProvider, RefractProvider — all from the default
`refract-ui` entry.
`Model` and `Carousel` are separate entries (`refract-ui/model`, `refract-ui/carousel`) so
`three`/`three-stdlib` never land in a bundle that doesn't use them.

## Install

```bash
npm i refract-ui
```

`react`, `react-dom`, and `framer-motion` are peer dependencies. `three` and
`three-stdlib` are optional peers, only required if you use `refract-ui/model`
or `refract-ui/carousel`.

## Usage

```tsx
import { Text, ThemeProvider, tokenStyles } from 'refract-ui';
import 'refract-ui/styles.css';

function App() {
  return (
    <ThemeProvider>
      <Text size="l">Hello</Text>
    </ThemeProvider>
  );
}
```

Required stylesheets: `refract-ui/styles.css` (component styles + a couple of
shared keyframes) and `refract-ui/tokens.css` (the CSS custom properties
components read from — see the Storybook Theming page for the full
reference). Optional: `refract-ui/reset.css` (a minimal CSS reset) and
`refract-ui/media.css` (the breakpoint contract as `@custom-media`, for
consumers running their own `postcss-preset-env`).

### Routing

Components that render links (`Link`, `Button`, `Breadcrumbs`) default to a
plain `<a>`. To route through your framework's link component, wrap your app
in `LinkProvider`:

```tsx
import { LinkProvider } from 'refract-ui';
import NextLink from 'next/link';
import { forwardRef } from 'react';

const NextLinkAdapter = forwardRef((props, ref) => <NextLink {...props} ref={ref} />);

<LinkProvider component={NextLinkAdapter}>{/* ... */}</LinkProvider>;
```

### Fonts

No fonts are bundled. `--fontStack` falls back to `--brandFontStack` (unset by
default) then the system font stack — set `--brandFontStack` to use your own
brand typeface.

### 3D components (`Model`, `Carousel`)

These use `three`/`three-stdlib` and load `.glb` device models via a DRACO
decoder. Both are optional peer dependencies — install them yourself, then:

```bash
cp -R node_modules/three/examples/jsm/libs/draco/gltf/ public/draco/
cp node_modules/refract-ui/dist/assets/*.glb public/models/
```

Both paths are configurable via `RefractProvider`'s `dracoDecoderPath` and
`modelBasePath` props if you serve them elsewhere.

### `ScrollTimeline`

A horizontal timeline whose travel is driven by vertical scroll: the section
reserves a runway several viewports tall, a viewport inside it sticks to the
top, and progress through the runway pans the track sideways.

```tsx
<ScrollTimeline
  items={items}                       // { id, label, group?, accent? }[]
  label="Work history"
  renderItem={(item, { active, distance, side }) => <Card … />}
  scrollContainerRef={containerRef}   // only if the page scrolls an element
  scrollRatio={0.8}                   // runway = scrollRatio × item count, in viewports
  onActiveChange={(item, index) => …}
>
  {/* pinned inside the sticky viewport for the whole pan */}
</ScrollTimeline>
```

`renderItem` owns the card; the axis, stem, dot, group heading and roving-tabindex
keyboard nav are the component's. Its `distance` argument is the signed offset from
the active item — key expensive card content (canvases, large images) off that so
only the items near the centre pay for it.

Two things it needs from the page:

- **A positioned scroll container.** When you pass `scrollContainerRef`, that
  element must not be `position: static`. Scroll progress is measured by walking
  `offsetParent` up from the timeline to the container; a static container is
  never in that chain, so the walk runs off the top of the document and progress
  silently pins at 0 — the timeline renders but never moves.
- **Room for anything you pin in the overlay.** `children` render over the track
  and stay put; set `--timelineInset` to the space they need at each end so the
  tallest card stops short of them.

Other knobs: `--timelineViewportHeight` (default `100svh`) sizes the sticky
viewport and the runway derived from it, and `--timelineFade` (default `5%`) is
how much of each end fades out, which also keeps cards clear of anything the
page fixes to the left or right edge.

## Development

```bash
npm install
npm run storybook     # dev, localhost:9009
npm run build          # vite build -> dist/
npm test               # vitest
npm run lint            # eslint
npm run stylelint
npm run typecheck
```

## Publishing

Versioning and npm publishing are automated with release-please + npm trusted
publishing (GitHub Actions OIDC) — see `.github/workflows/`. Pushing a
Conventional Commit to `main` is enough; there is no manual publish step.
