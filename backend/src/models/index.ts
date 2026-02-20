/**
 * Export all models
 * 
 * MongoDB Collection Names:
 * Mongoose auto-generates collection names by converting model names to lowercase and pluralizing.
 * - User              -> users
 * - Ticket            -> tickets
 * - TicketMessage     -> ticketmessages
 * - TicketStatusHistory -> ticketstatushistories
 * - AuditLog          -> auditlogs
 * - Article           -> articles
 * 
 * Use these collection names when querying MongoDB directly (e.g., via mongosh).
 */
export { User, UserRole, type IUser } from './User.js';
export {
  Ticket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  type ITicket,
  type IAttachment,
} from './Ticket.js';
export {
  TicketMessage,
  type ITicketMessage,
} from './TicketMessage.js';
export {
  TicketStatusHistory,
  type ITicketStatusHistory,
} from './TicketStatusHistory.js';
export {
  AuditLog,
  AuditAction,
  type IAuditLog,
} from './AuditLog.js';
export { Article, type IArticle } from './Article.js';
