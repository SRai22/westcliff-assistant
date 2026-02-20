/**
 * Shared constants for the application
 */

// 11 categories
export const CATEGORIES = [
  'Information Technology',
  'Learning Technologies',
  'Student Services',
  'International Affairs',
  'Registrar',
  'Student Accounts',
  'Financial Aid',
  'Alumni Affairs and Career Services',
  'Military / Veterans',
  'Student Life',
  'Learning Experience Design (LXD) Team',
] as const;

// 4 ticket statuses
export const TICKET_STATUSES = [
  'NEW',
  'IN_PROGRESS',
  'WAITING',
  'RESOLVED',
] as const;

// 3 priority levels
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;

// 2 user roles
export const ROLES = ['STUDENT', 'STAFF'] as const;

// Type exports for TypeScript
export type Category = (typeof CATEGORIES)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type Role = (typeof ROLES)[number];
