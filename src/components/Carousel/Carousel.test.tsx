import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Carousel } from './Carousel';

// Same rationale as Model.test.tsx: jsdom has no WebGL context, so the real
// WebGLRenderer throws on mount. A Proxy stub covers the wide, still-growing
// renderer surface Carousel touches without hand-listing every method.
// TextureLoader is stubbed the same way — it would otherwise issue a real
// network fetch for each image, which jsdom can't serve and which would
// surface as an unhandled rejection since these mount-only smoke tests never
// await the async image-load path.
//
// That load path (fetching real images, building the shader material,
// swipe/drag navigation math) needs real assets and a real GPU-backed
// canvas to verify meaningfully, so it stays Playwright/Storybook
// territory — this file only covers synchronous mount: DOM shape, controls,
// accessible labeling, and that construction doesn't throw.
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

  class MockTextureLoader {
    loadAsync() {
      return new Promise(() => {});
    }
  }

  return { ...three, WebGLRenderer: MockWebGLRenderer, TextureLoader: MockTextureLoader };
});

const images = [
  { src: { src: '/one.jpg' }, alt: 'First slide' },
  { src: { src: '/two.jpg' }, alt: 'Second slide' },
  { src: { src: '/three.jpg' }, alt: 'Third slide' },
];

describe('Carousel', () => {
  it('mounts without throwing and renders a canvas', () => {
    const { container } = render(<Carousel width={800} height={600} images={images} />);
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('renders previous and next controls', () => {
    render(<Carousel width={800} height={600} images={images} />);
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeInTheDocument();
  });

  it('renders a nav button per image', () => {
    render(<Carousel width={800} height={600} images={images} />);
    expect(screen.getByRole('button', { name: 'Jump to slide 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Jump to slide 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Jump to slide 3' })).toBeInTheDocument();
  });

  it('marks the current slide nav button as pressed', () => {
    render(<Carousel width={800} height={600} images={images} />);
    expect(screen.getByRole('button', { name: 'Jump to slide 1' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Jump to slide 2' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('describes the current slide via a live region', () => {
    render(<Carousel width={800} height={600} images={images} />);
    expect(screen.getByRole('img', { name: /Slide 1 of 3\. First slide/ })).toBeInTheDocument();
  });

  it('renders a placeholder image when provided', () => {
    const { container } = render(
      <Carousel width={800} height={600} images={images} placeholder={{ src: '/placeholder.jpg' }} />
    );
    expect(container.querySelector('img[src="/placeholder.jpg"]')).toBeInTheDocument();
  });

  it('unmounts cleanly (disposes the renderer/scene without throwing)', () => {
    const { unmount } = render(<Carousel width={800} height={600} images={images} />);
    expect(() => unmount()).not.toThrow();
  });
});
