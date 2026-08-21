import { AnimatePresence, usePresence } from 'framer-motion';
import { type MutableRefObject, type ReactNode, useEffect, useRef, useState } from 'react';

type TransitionTimeout = number | { enter: number; exit: number };
type TransitionStatus = 'entering' | 'entered' | 'exiting' | 'exited';
type TransitionRenderFn = (visible: boolean, status: TransitionStatus) => ReactNode;

interface TransitionProps {
  children: TransitionRenderFn;
  timeout?: TransitionTimeout;
  onEnter?: () => void;
  onEntered?: () => void;
  onExit?: () => void;
  onExited?: () => void;
  in?: boolean;
  unmount?: boolean;
}

interface TransitionContentProps {
  children: TransitionRenderFn;
  timeout: TransitionTimeout;
  enterTimeout: MutableRefObject<ReturnType<typeof setTimeout> | undefined>;
  exitTimeout: MutableRefObject<ReturnType<typeof setTimeout> | undefined>;
  onEnter?: () => void;
  onEntered?: () => void;
  onExit?: () => void;
  onExited?: () => void;
  show?: boolean;
}

export const Transition = ({
  children,
  timeout = 0,
  onEnter,
  onEntered,
  onExit,
  onExited,
  in: show,
  unmount,
}: TransitionProps) => {
  const enterTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const exitTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // Cancel a stale, opposite-direction timer left over from a rapid
    // show/hide flip — not the one TransitionContent's own effect just
    // scheduled for *this* direction (that ran first, since child effects
    // fire before parent effects, and clearing it here every time would
    // cancel every enter/exit before it ever gets to fire).
    if (show) {
      clearTimeout(exitTimeout.current);
    } else {
      clearTimeout(enterTimeout.current);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {(show || !unmount) && (
        <TransitionContent
          timeout={timeout}
          enterTimeout={enterTimeout}
          exitTimeout={exitTimeout}
          onEnter={onEnter}
          onEntered={onEntered}
          onExit={onExit}
          onExited={onExited}
          show={show}
        >
          {children}
        </TransitionContent>
      )}
    </AnimatePresence>
  );
};

const TransitionContent = ({
  children,
  timeout,
  enterTimeout,
  exitTimeout,
  onEnter,
  onEntered,
  onExit,
  onExited,
  show,
}: TransitionContentProps) => {
  const [status, setStatus] = useState<TransitionStatus>('exited');
  const [isPresent, safeToRemove] = usePresence();
  const [hasEntered, setHasEntered] = useState(false);
  const splitTimeout = typeof timeout === 'object';

  useEffect(() => {
    if (hasEntered || !show) return;

    const actualTimeout = splitTimeout ? timeout.enter : timeout;

    clearTimeout(enterTimeout.current);
    clearTimeout(exitTimeout.current);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasEntered(true);
    setStatus('entering');
    onEnter?.();

    // eslint-disable-next-line react-hooks/immutability
    enterTimeout.current = setTimeout(() => {
      setStatus('entered');
      onEntered?.();
    }, actualTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onEnter, onEntered, timeout, status, show]);

  useEffect(() => {
    if (isPresent && show) return;

    const actualTimeout = splitTimeout ? timeout.exit : timeout;

    clearTimeout(enterTimeout.current);
    clearTimeout(exitTimeout.current);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus('exiting');
    onExit?.();

    // eslint-disable-next-line react-hooks/immutability
    exitTimeout.current = setTimeout(() => {
      setStatus('exited');
      safeToRemove?.();
      onExited?.();
    }, actualTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPresent, onExit, safeToRemove, timeout, onExited, show]);

  return children(hasEntered && show ? isPresent : false, status);
};
