import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Transition } from './Transition';

describe('Transition', () => {
  it('renders content immediately when `in` is true', () => {
    render(<Transition in>{visible => <span>{visible ? 'visible' : 'hidden'}</span>}</Transition>);
    expect(screen.getByText(/visible|hidden/)).toBeInTheDocument();
  });

  it('reports visible true after the enter timeout elapses', async () => {
    render(
      <Transition in timeout={0}>
        {visible => <span>{visible ? 'shown' : 'not-shown'}</span>}
      </Transition>
    );
    await waitFor(() => expect(screen.getByText('shown')).toBeInTheDocument());
  });

  it('calls onEnter when transitioning in', async () => {
    const onEnter = vi.fn();
    render(
      <Transition in timeout={0} onEnter={onEnter}>
        {visible => <span>{String(visible)}</span>}
      </Transition>
    );
    await waitFor(() => expect(onEnter).toHaveBeenCalled());
  });

  it('calls onEntered after the enter timeout completes', async () => {
    const onEntered = vi.fn();
    render(
      <Transition in timeout={0} onEntered={onEntered}>
        {visible => <span>{String(visible)}</span>}
      </Transition>
    );
    await waitFor(() => expect(onEntered).toHaveBeenCalled());
  });

  it('unmounts content when `unmount` is true and `in` is false', () => {
    render(
      <Transition unmount in={false} timeout={0}>
        {visible => <span data-testid="content">{String(visible)}</span>}
      </Transition>
    );
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('keeps rendering content when `unmount` is false and `in` is false', () => {
    render(
      <Transition in={false} timeout={0}>
        {visible => <span data-testid="content">{String(visible)}</span>}
      </Transition>
    );
    expect(screen.getByTestId('content')).toHaveTextContent('false');
  });

  it('calls onExit and onExited when transitioning from true to false', async () => {
    const onExit = vi.fn();
    const onExited = vi.fn();

    const { rerender } = render(
      <Transition in timeout={0} unmount onExit={onExit} onExited={onExited}>
        {visible => <span data-testid="content">{String(visible)}</span>}
      </Transition>
    );
    await waitFor(() => expect(screen.getByTestId('content')).toHaveTextContent('true'));

    rerender(
      <Transition in={false} timeout={0} unmount onExit={onExit} onExited={onExited}>
        {visible => <span data-testid="content">{String(visible)}</span>}
      </Transition>
    );

    await waitFor(() => expect(onExit).toHaveBeenCalled());
    await waitFor(() => expect(onExited).toHaveBeenCalled());
  });
});
