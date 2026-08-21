import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TextArea } from './TextArea';

describe('TextArea', () => {
  it('renders a textarea element', () => {
    render(<TextArea value="" onChange={() => {}} aria-label="Message" />);
    expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA');
  });

  it('starts with minRows as the row count', () => {
    render(<TextArea value="" onChange={() => {}} aria-label="Message" minRows={3} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '3');
  });

  it('defaults minRows to 1', () => {
    render(<TextArea value="" onChange={() => {}} aria-label="Message" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '1');
  });

  it('fires onChange when typed into', () => {
    const onChange = vi.fn();
    render(<TextArea value="" onChange={onChange} aria-label="Message" />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hi there' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('sets the --resize custom property, defaulting to none', () => {
    render(<TextArea value="" onChange={() => {}} aria-label="Message" />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.style.getPropertyValue('--resize')).toBe('none');
  });

  it('sets a custom --resize value from the resize prop', () => {
    render(<TextArea value="" onChange={() => {}} aria-label="Message" resize="vertical" />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.style.getPropertyValue('--resize')).toBe('vertical');
  });

  it('merges a custom className', () => {
    render(<TextArea value="" onChange={() => {}} aria-label="Message" className="extra" />);
    expect(screen.getByRole('textbox')).toHaveClass('extra');
  });

  it('forwards arbitrary props', () => {
    render(<TextArea value="" onChange={() => {}} aria-label="Message" maxLength={50} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '50');
  });
});
