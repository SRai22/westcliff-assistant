/**
 * Ticket Status Transition rules (server-side)
 * Central place to validate status changes.
 *
 * Goal: prevent invalid jumps (e.g., RESOLVED -> NEW) unless explicitly allowed.
 * This file is intentionally small and easy to extend.
 */

import { TicketStatus } from '../models/index.js';

// If your enum values differ, update the keys/values here to match actual TicketStatus strings.
const ALLOWED: Record<string, string[]> = {
  [TicketStatus.NEW]: [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED],
  [TicketStatus.IN_PROGRESS]: [TicketStatus.RESOLVED],
  [TicketStatus.RESOLVED]: [TicketStatus.IN_PROGRESS], // allow reopen
};

// Always allow no-op (same status -> same status)
export function isValidStatusTransition(fromStatus: string, toStatus: string): boolean {
  if (fromStatus === toStatus) return true;

  const allowedNext = ALLOWED[fromStatus];
  if (!allowedNext) {
    // If we don't have rules for a status (newly added), don't hard-block.
    // You can change this to "return false" once rules are complete.
    return true;
  }
  return allowedNext.includes(toStatus);
}

export function getAllowedNextStatuses(fromStatus: string): string[] {
  return ALLOWED[fromStatus] ?? [];
}