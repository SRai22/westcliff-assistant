import { TicketStatus } from '../models/Ticket.js';

/**
 * Defines allowed status transitions
 */
const allowedTransitions: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.NEW]: [
    TicketStatus.IN_PROGRESS,
    TicketStatus.WAITING,
  ],
  [TicketStatus.IN_PROGRESS]: [
    TicketStatus.WAITING,
    TicketStatus.RESOLVED,
  ],
  [TicketStatus.WAITING]: [
    TicketStatus.IN_PROGRESS,
    TicketStatus.RESOLVED,
  ],
  [TicketStatus.RESOLVED]: [], // Terminal state
};

/**
 * Validates whether a status transition is allowed
 */
export function isValidStatusTransition(
  from: TicketStatus,
  to: TicketStatus
): boolean {
  if (from === to) return true; // allow no-op updates
  return allowedTransitions[from]?.includes(to) ?? false;
}