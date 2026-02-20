// Export all models
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
