import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SegmentedControl, SegmentedControlOption } from './SegmentedControl';

const renderControl = (currentIndex: number, onChange: (index: number) => void) =>
  render(
    <SegmentedControl currentIndex={currentIndex} onChange={onChange} label="View mode">
      <SegmentedControlOption>Grid</SegmentedControlOption>
      <SegmentedControlOption>List</SegmentedControlOption>
      <SegmentedControlOption>Table</SegmentedControlOption>
    </SegmentedControl>
  );

describe('SegmentedControl', () => {
  it('renders a radiogroup with the given label', () => {
    renderControl(0, vi.fn());
    expect(screen.getByRole('radiogroup', { name: 'View mode' })).toBeInTheDocument();
  });

  it('renders each option as a radio button', () => {
    renderControl(0, vi.fn());
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(radios.map(r => r.textContent)).toEqual(['Grid', 'List', 'Table']);
  });

  it('marks the option at currentIndex as checked', () => {
    renderControl(1, vi.fn());
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
    expect(radios[1]).toHaveAttribute('aria-checked', 'true');
    expect(radios[2]).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange with the clicked option index', () => {
    const onChange = vi.fn();
    renderControl(0, onChange);
    fireEvent.click(screen.getAllByRole('radio')[2]);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('only the selected option is tabbable', () => {
    renderControl(1, vi.fn());
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('tabindex', '-1');
    expect(radios[1]).toHaveAttribute('tabindex', '0');
    expect(radios[2]).toHaveAttribute('tabindex', '-1');
  });

  it('moves to the next option on ArrowRight', () => {
    const onChange = vi.fn();
    renderControl(0, onChange);
    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('moves to the previous option on ArrowLeft, wrapping around', () => {
    const onChange = vi.fn();
    renderControl(0, onChange);
    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith(2);
  });
});
