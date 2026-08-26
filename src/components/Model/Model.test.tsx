import { render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Model } from './Model';
import { ModelAnimationType } from './deviceModels';

// jsdom has no WebGL context, so any component that spins up a Three.js
// renderer (Model, Carousel) throws on mount against the real WebGLRenderer.
// A Proxy stub — rather than a hand-written one — is used because the
// renderer surface Model touches is wide (setPixelRatio, setRenderTarget,
// initTexture, capabilities.getMaxAnisotropy, ...) and keeps growing; any
// missing method would otherwise fail this test for a reason that has
// nothing to do with Model itself. The rest of three.js stays real, so
// Scene/Group/Mesh/etc. behave exactly as they do in production.
//
// This only covers the synchronous mount: the initial canvas/DOM shape,
// props wiring, and that construction doesn't throw. The async device-load
// path (Device's effect fetching real .glb/texture assets via GLTFLoader/
// TextureLoader) needs real network responses jsdom can't provide, so
// loaded-state and animation behavior for individual devices stays
// Playwright/Storybook territory, not unit-test territory.
// Hoisted so the `three` mock factory can close over it. Recording the canvas
// each renderer releases — rather than a bare call count — is what lets the
// tests below state the real invariant: no canvas still on the page has had its
// WebGL context taken away.
const { releasedCanvases } = vi.hoisted(() => ({
  releasedCanvases: [] as HTMLCanvasElement[],
}));

vi.mock('three', async importOriginal => {
  const three = await importOriginal<typeof import('three')>();

  function MockWebGLRenderer(
    this: Record<string, unknown>,
    parameters?: { canvas?: HTMLCanvasElement }
  ) {
    // Mirrors the real renderer: it uses the canvas it was given, or makes one
    // and owns it. Model takes the second path, and the tests below assert
    // against those very elements, so a stand-in canvas would make them vacuous.
    const domElement = parameters?.canvas ?? document.createElement('canvas');

    const target: Record<string, unknown> = {
      domElement,
      capabilities: { getMaxAnisotropy: () => 1, isWebGL2: true },
      outputColorSpace: three.SRGBColorSpace,
      forceContextLoss: () => releasedCanvases.push(domElement),
    };

    return new Proxy(target, {
      get(obj, prop) {
        if (prop in obj) return obj[prop as string];
        return () => undefined;
      },
      set(obj, prop, value) {
        obj[prop as string] = value;
        return true;
      },
    });
  }

  // The real TextureLoader issues a real network/image fetch — unavailable
  // in jsdom and would otherwise reject as an unhandled rejection, since
  // these mount-only smoke tests never await the async device-load path.
  // A promise that never settles keeps that in-flight load inert instead.
  class MockTextureLoader {
    loadAsync() {
      return new Promise(() => {});
    }
  }

  return { ...three, WebGLRenderer: MockWebGLRenderer, TextureLoader: MockTextureLoader };
});

vi.mock('three-stdlib', async importOriginal => {
  const stdlib = await importOriginal<typeof import('three-stdlib')>();

  // Same reasoning as the TextureLoader mock above: GLTFLoader.loadAsync
  // would otherwise attempt a real fetch for the .glb URL and reject.
  class MockGLTFLoader {
    setDRACOLoader() {}
    loadAsync() {
      return new Promise(() => {});
    }
  }

  class MockDRACOLoader {
    setDecoderPath() {}
  }

  return { ...stdlib, GLTFLoader: MockGLTFLoader, DRACOLoader: MockDRACOLoader };
});

const models = [
  {
    texture: { placeholder: '/placeholder.jpg' },
    position: { x: 0, y: 0, z: 0 },
    url: '/models/laptop.glb',
    animation: ModelAnimationType.SpringUp,
  },
];

describe('Model renderer lifecycle', () => {
  // A WebGL context is a scarce, browser-wide resource: they are capped (~16 in
  // Chrome) and the *oldest* is evicted once that cap is passed, so a Model that
  // holds onto its context after unmounting eventually kills an unrelated,
  // still-visible canvas elsewhere on the page. These assert both halves of
  // getting that right — release what is gone, keep what is on screen — against
  // a real mount/unmount rather than against the teardown helper in isolation.
  beforeEach(() => {
    releasedCanvases.length = 0;
  });

  it('releases its WebGL context and removes its canvas when it unmounts', () => {
    const { container, unmount } = render(<Model models={models} alt="A laptop" />);

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();

    unmount();

    expect(releasedCanvases).toContain(canvas);
  });

  it('leaves a live canvas behind after StrictMode remounts it', () => {
    // StrictMode runs the effect, tears it down, and runs it again. The renderer
    // owns its canvas, so the second run builds a fresh one — which is what lets
    // teardown release the context unconditionally. What must hold either way is
    // that exactly one canvas is left and its context is intact: a canvas whose
    // context has been lost can never hand out another one.
    const { container } = render(
      <StrictMode>
        <Model models={models} alt="A laptop" />
      </StrictMode>
    );

    const canvases = container.querySelectorAll('canvas');

    expect(canvases).toHaveLength(1);
    expect(releasedCanvases).not.toContain(canvases[0]);
  });
});

describe('Model', () => {
  it('mounts without throwing and renders a canvas', () => {
    const { container } = render(<Model models={models} alt="A laptop" />);
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('exposes an accessible role and label', () => {
    render(<Model models={models} alt="A laptop" />);
    expect(screen.getByRole('img', { name: 'A laptop' })).toBeInTheDocument();
  });

  it('starts with data-loaded false', () => {
    const { container } = render(<Model models={models} alt="A laptop" />);
    expect(container.firstChild).toHaveAttribute('data-loaded', 'false');
  });

  it('merges a custom className', () => {
    const { container } = render(<Model models={models} className="extra" alt="A laptop" />);
    expect(container.firstChild).toHaveClass('extra');
  });

  it('unmounts cleanly (disposes the renderer/scene without throwing)', () => {
    const { unmount } = render(<Model models={models} alt="A laptop" />);
    expect(() => unmount()).not.toThrow();
  });
});
