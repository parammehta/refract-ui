import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { List, ListItem } from './List';

describe('List', () => {
  it('renders as a ul by default', () => {
    render(
      <List>
        <ListItem>Item one</ListItem>
      </List>
    );
    expect(screen.getByRole('list').tagName).toBe('UL');
  });

  it('renders as an ol when ordered is true', () => {
    render(
      <List ordered>
        <ListItem>Item one</ListItem>
      </List>
    );
    expect(screen.getByRole('list').tagName).toBe('OL');
  });

  it('renders its children', () => {
    render(
      <List>
        <ListItem>First</ListItem>
        <ListItem>Second</ListItem>
      </List>
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('merges a custom className on the list', () => {
    render(<List className="extra">{null}</List>);
    expect(screen.getByRole('list')).toHaveClass('extra');
  });

  it('forwards arbitrary props on ListItem', () => {
    render(
      <List>
        <ListItem aria-label="labelled">Item</ListItem>
      </List>
    );
    expect(screen.getByLabelText('labelled')).toBeInTheDocument();
  });
});
