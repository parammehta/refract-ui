import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('renders a label and an input associated by id', () => {
    render(<Input id="email" label="Email" value="" onChange={() => {}} />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });

  it('generates an id when none is provided', () => {
    render(<Input label="Name" value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('renders a textarea when multiline is true', () => {
    render(<Input label="Message" multiline value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Message').tagName).toBe('TEXTAREA');
  });

  it('fires onChange with the typed value', () => {
    const onChange = vi.fn();
    render(<Input label="Name" value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'abc' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('sets data-focused on the label while focused', () => {
    render(<Input id="fname" label="First name" value="" onChange={() => {}} />);
    const input = screen.getByLabelText('First name');
    fireEvent.focus(input);
    expect(document.querySelector('label')).toHaveAttribute('data-focused', 'true');
    fireEvent.blur(input);
    expect(document.querySelector('label')).toHaveAttribute('data-focused', 'false');
  });

  it('calls the provided onBlur handler', () => {
    const onBlur = vi.fn();
    render(<Input label="Name" value="" onChange={() => {}} onBlur={onBlur} />);
    fireEvent.blur(screen.getByLabelText('Name'));
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('sets data-filled when a value is present', () => {
    render(<Input id="fname" label="First name" value="hello" onChange={() => {}} />);
    expect(document.querySelector('label')).toHaveAttribute('data-filled', 'true');
  });

  it('shows an error message with role alert when error is set', () => {
    render(<Input label="Name" value="" onChange={() => {}} error="Required field" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Required field');
  });

  it('sets data-error on the container when an error is present', () => {
    const { container } = render(
      <Input label="Name" value="" onChange={() => {}} error="Required field" />
    );
    expect(container.firstChild).toHaveAttribute('data-error', 'true');
  });

  it('does not render an alert when there is no error', () => {
    render(<Input label="Name" value="" onChange={() => {}} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('applies required, maxLength, type, and placeholder to the input', () => {
    render(
      <Input
        label="Name"
        value=""
        onChange={() => {}}
        required
        maxLength={10}
        type="email"
        placeholder="you@example.com"
      />
    );
    const input = screen.getByLabelText('Name');
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('maxlength', '10');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'you@example.com');
  });
});
