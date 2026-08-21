import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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
vi.mock('three', async importOriginal => {
  const three = await importOriginal<typeof import('three')>();

  function MockWebGLRenderer(this: Record<string, unknown>) {
    const target: Record<string, unknown> = {
      domElement: document.createElement('canvas'),
      capabilities: { getMaxAnisotropy: () => 1, isWebGL2: true },
      outputColorSpace: three.SRGBColorSpace,
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
