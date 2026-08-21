import '@testing-library/jest-dom/vitest';

// jsdom does not implement ResizeObserver/IntersectionObserver, but several
// components touch them on mount. Real browsers invoke the callback once
// synchronously-ish as soon as `observe()` is called with the element's
// initial size/intersection state — SegmentedControl relies on exactly that
// first callback to re-render once its options have registered themselves
// (see the `react-hooks/refs` comments in SegmentedControl.tsx), so a purely
// no-op stub would leave it stuck showing stale state. These mocks invoke the
// callback synchronously on observe() with a zeroed entry, which is enough to
// trigger that re-render; behavior that depends on *real* size/intersection
// values still belongs in Playwright, not here.
class MockResizeObserver implements ResizeObserver {
  #callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.#callback = callback;
  }

  observe(target: Element) {
    const entry = { target, contentRect: target.getBoundingClientRect() } as ResizeObserverEntry;
    this.#callback([entry], this);
  }

  unobserve() {}
  disconnect() {}
}

class MockIntersectionObserver implements IntersectionObserver {
  #callback: IntersectionObserverCallback;
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(callback: IntersectionObserverCallback) {
    this.#callback = callback;
  }

  observe(target: Element) {
    const entry = {
      target,
      isIntersecting: false,
      boundingClientRect: target.getBoundingClientRect(),
      intersectionRatio: 0,
      intersectionRect: target.getBoundingClientRect(),
      rootBounds: null,
      time: 0,
    } as IntersectionObserverEntry;
    this.#callback([entry], this);
  }

  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

if (!('ResizeObserver' in globalThis)) {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    writable: true,
    value: MockResizeObserver,
  });
}

if (!('IntersectionObserver' in globalThis)) {
  Object.defineProperty(globalThis, 'IntersectionObserver', {
    writable: true,
    value: MockIntersectionObserver,
  });
}

// jsdom has no real media pipeline, so HTMLMediaElement.play()/pause() throw
// "not implemented" — Image's video branch calls both on mount and on the
// pause/play button's click handler. Stub them to no-ops so those code paths
// are actually exercisable in tests instead of just logging noise.
if (typeof HTMLMediaElement !== 'undefined') {
  HTMLMediaElement.prototype.play = () => Promise.resolve();
  HTMLMediaElement.prototype.pause = () => {};
}
