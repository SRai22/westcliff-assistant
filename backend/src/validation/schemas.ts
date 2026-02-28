/**
 * Zod validation schemas for request validation
 * All schemas reference shared constants to ensure consistency
 */

import { z } from 'zod';
import { CATEGORIES, TICKET_STATUSES, PRIORITIES, ROLES } from '../constants.js';

// Login request schema
export const loginSchema = z.object({
  idToken: z.string().min(1, 'Google ID token is required'),
});

// Ticket creation schema (intake confirmation)
export const createTicketSchema = z.object({
  category: z.enum(CATEGORIES as readonly [string, ...string[]], {
    message: 'Invalid category',
  }),
  service: z.string().optional(),
  priority: z.enum(PRIORITIES as readonly [string, ...string[]], {
    message: 'Invalid priority',
  }),
  summary: z
    .string()
    .min(5, 'Summary must be at least 5 characters')
    .max(500, 'Summary must not exceed 500 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters'),
  attachments: z
    .array(
      z.object({
        fileName: z.string(),
        fileUrl: z.string().url('Invalid file URL'),
        fileSize: z.number().positive('File size must be positive'),
        mimeType: z.string(),
      })
    )
    .optional()
    .default([]),
});

// Ticket status update schema
export const updateTicketStatusSchema = z.object({
  status: z.enum(TICKET_STATUSES as readonly [string, ...string[]], {
    message: 'Invalid status',
  }),
  reason: z.string().optional(),
});

// Ticket update schema (for editing tickets)
export const updateTicketSchema = z.object({
  category: z.enum(CATEGORIES as readonly [string, ...string[]]).optional(),
  service: z.string().optional(),
  priority: z.enum(PRIORITIES as readonly [string, ...string[]]).optional(),
  summary: z
    .string()
    .min(5, 'Summary must be at least 5 characters')
    .max(500, 'Summary must not exceed 500 characters')
    .optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  assigneeId: z.string().optional(),
});

// Message creation schema
export const createMessageSchema = z.object({
  body: z.string().min(1, 'Message body cannot be empty'),
  isInternalNote: z.boolean().optional().default(false),
});

// Article query params schema
export const articleQuerySchema = z.object({
  category: z.enum(CATEGORIES as readonly [string, ...string[]]).optional(),
  tags: z.string().optional(), // Comma-separated tags
  search: z.string().optional(),
  isPublished: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive().max(100)),
});

// Article creation schema
export const createArticleSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters'),
  category: z.enum(CATEGORIES as readonly [string, ...string[]], {
    message: 'Invalid category',
  }),
  summary: z
    .string()
    .min(10, 'Summary must be at least 10 characters')
    .max(500, 'Summary must not exceed 500 characters'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  tags: z.array(z.string()).optional().default([]),
  isPublished: z.boolean().optional().default(false),
});

// Article update schema
export const updateArticleSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters')
    .optional(),
  category: z.enum(CATEGORIES as readonly [string, ...string[]]).optional(),
  summary: z
    .string()
    .min(10, 'Summary must be at least 10 characters')
    .max(500, 'Summary must not exceed 500 characters')
    .optional(),
  content: z.string().min(50, 'Content must be at least 50 characters').optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
});

// Ticket query params schema
export const ticketQuerySchema = z.object({
  status: z.enum(TICKET_STATUSES as readonly [string, ...string[]]).optional(),
  category: z.enum(CATEGORIES as readonly [string, ...string[]]).optional(),
  priority: z.enum(PRIORITIES as readonly [string, ...string[]]).optional(),
  assigneeId: z.string().optional(),
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),
  limit: z
    .string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive().max(100)),
});

// AI Intake schemas
export const aiIntakeStartSchema = z.object({
  text: z.string().min(5, 'Query must be at least 5 characters'),
  userContext: z.record(z.string(), z.unknown()).optional(),
});

export const aiIntakeAnswerSchema = z.object({
  triageResult: z.object({
    category: z.enum(CATEGORIES as readonly [string, ...string[]]),
    service: z.string(),
    clarifyingQuestions: z.array(
      z.object({
        id: z.string(),
        question: z.string(),
        type: z.enum(['radio', 'checkbox', 'text']),
        options: z.array(z.string()).optional(),
      })
    ),
    suggestedArticles: z.array(z.unknown()), // Article IDs or objects
    ticketDraft: z.object({
      summary: z.string(),
      description: z.string(),
      priority: z.enum(PRIORITIES as readonly [string, ...string[]]),
    }),
    confidence: z.number().min(0).max(1),
    handoffRecommendation: z.enum(['ARTICLE_FIRST', 'CREATE_TICKET']),
  }),
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
});

// AI Staff Assist schemas
export const aiSummarizeSchema = z.object({
  ticketId: z.string(),
  messages: z.array(
    z.object({
      senderRole: z.string(),
      senderName: z.string(),
      body: z.string(),
      createdAt: z.string(),
    })
  ),
});

export const aiDraftReplySchema = z.object({
  ticketId: z.string(),
  messages: z.array(
    z.object({
      senderRole: z.string(),
      senderName: z.string(),
      body: z.string(),
      createdAt: z.string(),
    })
  ),
  tone: z.enum(['professional', 'friendly', 'concise']).optional().default('professional'),
});

export const aiSuggestStepsSchema = z.object({
  ticketId: z.string(),
  messages: z.array(
    z.object({
      senderRole: z.string(),
      senderName: z.string(),
      body: z.string(),
      createdAt: z.string(),
    })
  ),
});

// Type exports for TypeScript
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type ArticleQueryInput = z.infer<typeof articleQuerySchema>;
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type TicketQueryInput = z.infer<typeof ticketQuerySchema>;
export type AIIntakeStartInput = z.infer<typeof aiIntakeStartSchema>;
export type AIIntakeAnswerInput = z.infer<typeof aiIntakeAnswerSchema>;
export type AISummarizeInput = z.infer<typeof aiSummarizeSchema>;
export type AIDraftReplyInput = z.infer<typeof aiDraftReplySchema>;
export type AISuggestStepsInput = z.infer<typeof aiSuggestStepsSchema>;
