// User & Auth
export type UserRole = 'STUDENT' | 'STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

// Categories
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

export type Category = typeof CATEGORIES[number];

// Ticket Status
export type TicketStatus = 'NEW' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED';

export const TICKET_STATUSES: TicketStatus[] = ['NEW', 'IN_PROGRESS', 'WAITING', 'RESOLVED'];

// Priority
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];

// Knowledge Base Article
export interface Article {
  id: string;
  title: string;
  category: Category;
  summary: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

// Ticket
export interface Ticket {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  category: Category;
  service: string;
  priority: Priority;
  status: TicketStatus;
  summary: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  assigneeId?: string;
  assigneeName?: string;
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

// Message (Conversation)
export type SenderRole = 'STUDENT' | 'STAFF' | 'AI';

export interface Message {
  id: string;
  ticketId: string;
  senderRole: SenderRole;
  senderName: string;
  body: string;
  createdAt: string;
  isInternalNote: boolean;
}

// AI Triage Response
export interface ClarifyingQuestion {
  id: string;
  question: string;
  type: 'radio' | 'checkbox' | 'text';
  options?: string[];
}

export interface AITriageResponse {
  category: Category;
  service: string;
  clarifyingQuestions: ClarifyingQuestion[];
  suggestedArticles: Article[];
  ticketDraft: {
    summary: string;
    description: string;
    priority: Priority;
  };
  confidence: number;
  handoffRecommendation: 'ARTICLE_FIRST' | 'CREATE_TICKET';
}

// UI State
export interface TriageState {
  step: 'input' | 'clarifying' | 'suggestion' | 'preview' | 'submitted';
  userQuery: string;
  aiResponse?: AITriageResponse;
  answers: Record<string, string | string[]>;
}
