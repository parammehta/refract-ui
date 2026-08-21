import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Table, TableRow, TableHead, TableBody, TableHeadCell, TableCell } from './Table';

describe('Table', () => {
  it('renders a full table structure', () => {
    render(
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Name</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Value' })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(2);
  });

  it('renders each subcomponent as the correct tag', () => {
    const { container } = render(
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>H</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>C</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(container.querySelector('table')).toBeInTheDocument();
    expect(container.querySelector('thead')).toBeInTheDocument();
    expect(container.querySelector('tbody')).toBeInTheDocument();
    expect(container.querySelectorAll('tr')).toHaveLength(2);
    expect(container.querySelector('th')).toBeInTheDocument();
    expect(container.querySelector('td')).toBeInTheDocument();
  });
});
