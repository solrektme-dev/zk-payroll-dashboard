import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BulkStatusUpdate from '@/components/features/employees/BulkStatusUpdate';

describe('BulkStatusUpdate', () => {
  it('renders the section heading', () => {
    render(<BulkStatusUpdate />);
    expect(screen.getByText('Bulk employee status update')).toBeInTheDocument();
  });

  it('renders employee rows', () => {
    render(<BulkStatusUpdate />);
    expect(screen.getByText('Alice Mensah')).toBeInTheDocument();
    expect(screen.getByText('Kwame Asante')).toBeInTheDocument();
  });

  it('select-all checkbox selects all employees', async () => {
    const user = userEvent.setup();
    render(<BulkStatusUpdate />);
    await user.click(screen.getByRole('checkbox', { name: /select all/i }));
    const rowChecks = screen.getAllByRole('checkbox', { name: /select /i });
    rowChecks.forEach((c) => expect(c).toBeChecked());
  });

  it('individual row checkbox toggles selection', async () => {
    const user = userEvent.setup();
    render(<BulkStatusUpdate />);
    const alice = screen.getByRole('checkbox', { name: /select alice mensah/i });
    await user.click(alice);
    expect(alice).toBeChecked();
    await user.click(alice);
    expect(alice).not.toBeChecked();
  });

  it('Review changes button is disabled when nothing selected', () => {
    render(<BulkStatusUpdate />);
    expect(screen.getByRole('button', { name: /review changes/i })).toBeDisabled();
  });

  it('Review changes button enables when employee is selected', async () => {
    const user = userEvent.setup();
    render(<BulkStatusUpdate />);
    await user.click(screen.getByRole('checkbox', { name: /select alice mensah/i }));
    expect(screen.getByRole('button', { name: /review changes/i })).not.toBeDisabled();
  });

  it('shows confirmation step after clicking Review changes', async () => {
    const user = userEvent.setup();
    render(<BulkStatusUpdate />);
    await user.click(screen.getByRole('checkbox', { name: /select alice mensah/i }));
    await user.click(screen.getByRole('button', { name: /review changes/i }));
    expect(screen.getByText(/confirm bulk update/i)).toBeInTheDocument();
    expect(screen.getByText('Alice Mensah')).toBeInTheDocument();
  });

  it('back button returns to selection step', async () => {
    const user = userEvent.setup();
    render(<BulkStatusUpdate />);
    await user.click(screen.getByRole('checkbox', { name: /select alice mensah/i }));
    await user.click(screen.getByRole('button', { name: /review changes/i }));
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByText('Bulk employee status update')).toBeInTheDocument();
  });

  it('shows result step after confirming', async () => {
    const user = userEvent.setup();
    render(<BulkStatusUpdate />);
    await user.click(screen.getByRole('checkbox', { name: /select alice mensah/i }));
    await user.click(screen.getByRole('button', { name: /review changes/i }));
    await user.click(screen.getByRole('button', { name: /apply changes/i }));
    expect(screen.getByText(/update complete/i)).toBeInTheDocument();
  });

  it('done button resets to selection step', async () => {
    const user = userEvent.setup();
    render(<BulkStatusUpdate />);
    await user.click(screen.getByRole('checkbox', { name: /select alice mensah/i }));
    await user.click(screen.getByRole('button', { name: /review changes/i }));
    await user.click(screen.getByRole('button', { name: /apply changes/i }));
    await user.click(screen.getByRole('button', { name: /done/i }));
    expect(screen.getByText('Bulk employee status update')).toBeInTheDocument();
  });

  it('target status dropdown defaults to active', () => {
    render(<BulkStatusUpdate />);
    const select = screen.getByRole('combobox', { name: /target status/i }) as HTMLSelectElement;
    expect(select.value).toBe('active');
  });

  it('selected count updates as rows are toggled', async () => {
    const user = userEvent.setup();
    render(<BulkStatusUpdate />);
    expect(screen.getByText('0 selected')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: /select alice mensah/i }));
    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });
});
