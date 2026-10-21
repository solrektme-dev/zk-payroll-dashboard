import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IncidentBanner } from '@/components/ui/IncidentBanner';

describe('IncidentBanner', () => {
  it('renders a warning banner with correct message', () => {
    render(<IncidentBanner variant="warning" message="Low treasury balance" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Low treasury balance')).toBeInTheDocument();
  });

  it('renders an error banner', () => {
    render(<IncidentBanner variant="error" message="Submission failed" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Submission failed')).toBeInTheDocument();
  });

  it('renders a maintenance banner', () => {
    render(<IncidentBanner variant="maintenance" message="Scheduled downtime" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Scheduled downtime')).toBeInTheDocument();
  });

  it('does not render a dismiss button when dismissible is false', () => {
    render(<IncidentBanner variant="warning" message="msg" dismissible={false} />);
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
  });

  it('renders a dismiss button when dismissible is true', () => {
    render(<IncidentBanner variant="warning" message="msg" dismissible />);
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
  });

  it('hides the banner after clicking dismiss', async () => {
    const user = userEvent.setup();
    render(<IncidentBanner variant="warning" message="dismiss me" dismissible />);
    await user.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('calls onDismiss callback when dismissed', async () => {
    const onDismiss = vi.fn();
    const user = userEvent.setup();
    render(<IncidentBanner variant="error" message="msg" dismissible onDismiss={onDismiss} />);
    await user.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('banner remains visible when not dismissed', () => {
    render(<IncidentBanner variant="maintenance" message="still here" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
