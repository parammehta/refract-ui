import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CSSProperties, KeyboardEvent, ReactNode, RefObject } from 'react';
import { useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { classes } from '../../utils/style';
import styles from './ScrollTimeline.module.css';

export interface ScrollTimelineItem {
  /** Stable React key. */
  id: string;
  /**
   * Rendered as a heading above the axis when it differs from the previous
   * item's, so a run of items sharing one can read as a single band.
   */
  group?: string;
  /** Accessible name for this item's node button. */
  label: string;
  /** Per-item accent, exposed to the card as the `--accent` custom property. */
  accent?: string;
}

export interface ScrollTimelineItemState {
  index: number;
  /** True for the item nearest the centre of the viewport. */
  active: boolean;
  /**
   * Signed distance from the active item. The consumer's own budget for
   * expensive card content (images, canvases) is meant to key off this rather
   * than off `active`, which is only ever true for one item.
   */
  distance: number;
  /** Which side of the axis this item's card sits on. */
  side: 'above' | 'below';
}

export interface ScrollTimelineProps {
  items: ScrollTimelineItem[];
  /** Card body for one item. The axis, stem, dot and group heading are ours. */
  renderItem: (item: ScrollTimelineItem, state: ScrollTimelineItemState) => ReactNode;
  /**
   * The scrolling ancestor, when the page scrolls an element rather than the
   * document. Read once on mount, so it has to be attached by first layout.
   */
  scrollContainerRef?: RefObject<HTMLElement | null>;
  /** Accessible name for the timeline region. */
  label: string;
  /** Fires when the item nearest the centre changes. */
  onActiveChange?: (item: ScrollTimelineItem, index: number) => void;
  /**
   * Vertical runway, as a multiple of the sticky viewport's height, that the
   * horizontal travel is spread over. Higher is slower and more deliberate.
   */
  scrollRatio?: number;
  /**
   * Rendered inside the sticky viewport, over the track — so it stays put for
   * the whole pan. Section headings and a call to action keyed off the active
   * item belong here rather than outside, where they would scroll away.
   */
  children?: ReactNode;
  className?: string;
}

const springConfig = { stiffness: 82, damping: 19, mass: 0.5 };

/**
 * A horizontal timeline whose travel is driven by vertical scroll: the section
 * reserves a tall runway, a viewport inside it sticks to the top, and progress
 * through the runway maps to `translateX` on the track.
 *
 * The runway is derived from the item count rather than fixed in CSS, so adding
 * items lengthens the section instead of speeding up the pan, and the travel is
 * measured from the slots themselves so every item lands dead centre.
 *
 * The track is written imperatively from a MotionValue subscription rather than
 * rendered as a `motion.div`. Both produce the same transform, but `motion.*`
 * would pull framer-motion's full feature bundle into every consumer of this
 * package's main entry, and nothing else in the library does that today.
 */
export const ScrollTimeline = ({
  items,
  renderItem,
  scrollContainerRef,
  label,
  onActiveChange,
  scrollRatio = 1,
  children,
  className,
}: ScrollTimelineProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Array<HTMLButtonElement | null>>([]);
  // The track offsets that put the first and last item at the centre of the
  // viewport. Progress maps between them.
  const [travel, setTravel] = useState({ start: 0, end: 0 });
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    // framer-motion 7's types predate `RefObject<T | null>`, which is what
    // `useRef<T>(null)` produces under this repo's React types. It only ever
    // reads `.current` and null-checks it, so the cast is a types-only gap.
    container: scrollContainerRef as RefObject<HTMLElement> | undefined,
    target: sectionRef as RefObject<HTMLElement>,
    offset: ['start start', 'end end'],
    // Not a layout effect. useScroll reads `container.current` once, on mount,
    // and React attaches a parent's ref *after* its children's layout effects
    // run — so a layout-effect read would find `null` and silently fall back to
    // scrolling the window, which is the one thing this prop exists to avoid.
    // Passive effects run after the whole commit, when the ref is attached.
    layoutEffect: false,
  });

  // Reduced motion gets the raw progress: the spring's overshoot is the part
  // that reads as motion for its own sake.
  const smoothed = useSpring(scrollYProgress, springConfig);
  const progress = reduceMotion ? scrollYProgress : smoothed;

  // Measure the travel from where the slots actually are, rather than deriving
  // it from the track's overflow. Overflow alone assumes the first item starts
  // centred and the last ends centred, which depends entirely on the track's
  // lead-in padding happening to equal half the viewport minus half a card —
  // it never does, and every item ends up centred by up to half a card off.
  //
  // Observing both boxes covers the two ways this changes: the viewport on
  // resize, and the track when a card's content settles (a font swap, an image
  // finally sizing itself).
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const measure = () => {
      const centreOffset = (slot: HTMLElement) =>
        slot.offsetLeft + slot.offsetWidth / 2 - viewport.clientWidth / 2;

      const first = nodeRefs.current[0]?.parentElement;
      const last = nodeRefs.current[items.length - 1]?.parentElement;
      if (!first || !last) return;

      const next = { start: centreOffset(first), end: centreOffset(last) };
      setTravel(current =>
        current.start === next.start && current.end === next.end ? current : next
      );
    };

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(track);
    measure();

    return () => observer.disconnect();
  }, [items.length]);

  // Map progress onto the track by hand rather than through `useTransform`.
  // `progress` swaps identity when `useReducedMotion` resolves from null to a
  // boolean, and a plain subscription re-subscribes on that cleanly; a
  // transform chained off it would be holding the pre-swap source.
  useEffect(() => {
    const write = (value: number) => {
      const track = trackRef.current;
      if (!track) return;
      const x = travel.start + (travel.end - travel.start) * value;
      track.style.transform = `translate3d(${-x}px, 0, 0)`;
    };

    write(progress.get());
    return progress.on('change', write);
  }, [progress, travel]);

  const itemCount = items.length;

  // Which item is nearest the centre. Derived from progress rather than from an
  // IntersectionObserver on the cards: the cards move under a stationary
  // viewport, and observers report against the scrolling box, not a transform.
  useEffect(() => {
    if (itemCount === 0) return;

    const read = (value: number) => {
      const next = Math.min(
        itemCount - 1,
        Math.max(0, Math.round(value * (itemCount - 1)))
      );
      setActiveIndex(current => (current === next ? current : next));
    };

    read(progress.get());
    return progress.on('change', read);
  }, [progress, itemCount]);

  const activeItem = items[activeIndex];

  useEffect(() => {
    if (activeItem) onActiveChange?.(activeItem, activeIndex);
  }, [activeItem, activeIndex, onActiveChange]);

  /**
   * Scroll to an item by inverting the mapping: find the `translateX` that
   * centres it, convert that back to a progress ratio, and move the *vertical*
   * scroll there. Keyboard navigation then travels the same path the wheel
   * does, so focus and the visible track can never disagree.
   */
  const goToItem = useCallback(
    (rawIndex: number) => {
      const index = Math.max(0, Math.min(rawIndex, itemCount - 1));
      const node = nodeRefs.current[index];
      const slot = node?.parentElement;
      const viewport = viewportRef.current;
      const section = sectionRef.current;
      if (!node || !slot || !viewport || !section) return;

      node.focus({ preventScroll: true });

      const targetX = slot.offsetLeft + slot.offsetWidth / 2 - viewport.clientWidth / 2;
      const span = travel.end - travel.start;
      const ratio = span === 0 ? 0 : (targetX - travel.start) / span;

      const clamped = Math.max(0, Math.min(1, ratio));
      const scroller = scrollContainerRef?.current;
      const behavior = reduceMotion ? 'auto' : 'smooth';

      if (scroller) {
        const sectionTop =
          section.getBoundingClientRect().top -
          scroller.getBoundingClientRect().top +
          scroller.scrollTop;
        const runway = section.offsetHeight - scroller.clientHeight;
        scroller.scrollTo({ top: sectionTop + runway * clamped, behavior });
        return;
      }

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const runway = section.offsetHeight - window.innerHeight;
      window.scrollTo({ top: sectionTop + runway * clamped, behavior });
    },
    [itemCount, travel, scrollContainerRef, reduceMotion]
  );

  const onNodeKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const target = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: itemCount - 1,
    }[event.key];

    if (target === undefined) return;
    event.preventDefault();
    goToItem(target);
  };

  // Sides alternate so consecutive cards never queue up in one band, which is
  // what lets the cards be tall relative to the viewport.
  const sides = useMemo<Array<'above' | 'below'>>(
    () => items.map((_, index) => (index % 2 === 0 ? 'above' : 'below')),
    [items]
  );

  if (itemCount === 0) return null;

  return (
    <div
      className={classes(styles.scroll, className)}
      ref={sectionRef}
      style={{ '--runway': `${scrollRatio * itemCount}` } as CSSProperties}
    >
      <div
        className={styles.viewport}
        ref={viewportRef}
        role="region"
        aria-label={label}
      >
        <div
          className={styles.track}
          ref={trackRef}
          style={{ '--itemCount': itemCount } as CSSProperties}
        >
          <div className={styles.axis} aria-hidden="true" />

          {items.map((item, index) => {
            const side = sides[index];
            const startsGroup =
              !!item.group && (index === 0 || items[index - 1]?.group !== item.group);

            return (
              <div
                className={styles.slot}
                data-side={side}
                key={item.id}
                style={{ '--accent': item.accent ?? 'rgb(var(--rgbAccent))' } as CSSProperties}
              >
                {startsGroup && (
                  <span className={styles.group} aria-hidden="true">
                    {item.group}
                  </span>
                )}
                <span className={styles.stem} aria-hidden="true" />
                <span className={styles.dot} aria-hidden="true" />
                <button
                  className={styles.card}
                  type="button"
                  ref={node => {
                    nodeRefs.current[index] = node;
                  }}
                  // Roving tabindex: the timeline is one tab stop, and the
                  // arrow keys move within it. Tabbing onto every card would
                  // scroll the page a full runway-length per press.
                  tabIndex={activeIndex === index ? 0 : -1}
                  data-active={activeIndex === index}
                  aria-label={item.label}
                  aria-current={activeIndex === index}
                  onFocus={() => setActiveIndex(index)}
                  onKeyDown={event => onNodeKeyDown(event, index)}
                  onClick={() => goToItem(index)}
                >
                  {renderItem(item, {
                    index,
                    active: activeIndex === index,
                    distance: index - activeIndex,
                    side,
                  })}
                </button>
              </div>
            );
          })}
        </div>

        {!!children && <div className={styles.overlay}>{children}</div>}
      </div>
    </div>
  );
};
