import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { TimeSlot } from '@booking/shared';
import { AvailabilityView } from './AvailabilityView';

function makeSlot(start: string, end: string): TimeSlot {
  return { start, end };
}

describe('AvailabilityView', () => {
  it('renders a message when there are no slots', () => {
    render(
      <AvailabilityView slots={[]} loading={false} onSelectSlot={() => {}} onRefresh={() => {}} />,
    );

    expect(screen.getByText('No available slots.')).toBeInTheDocument();
  });

  it('renders slots when provided', () => {
    const slots: TimeSlot[] = [makeSlot('2024-01-01T09:00:00.000Z', '2024-01-01T09:30:00.000Z')];

    render(
      <AvailabilityView
        slots={slots}
        loading={false}
        onSelectSlot={() => {}}
        onRefresh={() => {}}
      />,
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(1);
  });
});
