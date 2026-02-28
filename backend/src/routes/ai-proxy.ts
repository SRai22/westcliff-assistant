/**
 * AI Proxy Routes
 * 
 * Proxies requests to the AI service with validation and fallback stub responses
 * - Intake endpoints: Used during ticket creation flow (authenticated users)
 * - Staff assist endpoints: Staff-only features for ticket management
 */

import { Router, Request, Response } from 'express';
import { validateBody } from '../middleware/validate.js';
import {
  aiIntakeStartSchema,
  aiIntakeAnswerSchema,
  aiSummarizeSchema,
  aiDraftReplySchema,
  aiSuggestStepsSchema,
} from '../validation/schemas.js';
import { requireAuth, requireStaff } from '../middleware/auth.js';
import { aiService } from '../services/aiClient.js';
import { Ticket, TicketMessage } from '../models/index.js';

const router = Router();

/**
 * POST /tickets/intake/start
 * Initial AI triage - classify issue and generate clarifying questions
 * Available to all authenticated users
 */
router.post(
  '/tickets/intake/start',
  requireAuth,
  validateBody(aiIntakeStartSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { text, userContext } = req.body;

      // Call AI service (falls back to stubs if unavailable)
      const triageResponse = await aiService.startIntake(text, userContext);

      res.json(triageResponse);
    } catch (error) {
      console.error('[AI Proxy] Intake start error:', error);
      res.status(500).json({
        error: 'Failed to process intake request',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * POST /tickets/intake/answer
 * Refine ticket draft based on user answers to clarifying questions
 * Available to all authenticated users
 */
router.post(
  '/tickets/intake/answer',
  requireAuth,
  validateBody(aiIntakeAnswerSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { triageResult, answers } = req.body;

      // Call AI service (falls back to stubs if unavailable)
      const followupResponse = await aiService.followupIntake(triageResult, answers);

      res.json(followupResponse);
    } catch (error) {
      console.error('[AI Proxy] Intake answer error:', error);
      res.status(500).json({
        error: 'Failed to process followup request',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * POST /tickets/:id/ai/summarize
 * Generate AI summary of ticket conversation (STAFF ONLY)
 */
router.post(
  '/tickets/:id/ai/summarize',
  requireStaff,
  validateBody(aiSummarizeSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const ticketId = req.params.id;
      const { messages } = req.body;

      // Verify ticket exists
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      // If no messages provided in body, fetch from database
      let messageData = messages;
      if (!messages || messages.length === 0) {
        const dbMessages = await TicketMessage.find({ ticketId })
          .sort({ createdAt: 1 })
          .lean();
        messageData = dbMessages.map((msg) => ({
          senderRole: msg.senderRole,
          senderName: msg.senderName,
          body: msg.body,
          createdAt: msg.createdAt.toISOString(),
        }));
      }

      // Call AI service (falls back to stubs if unavailable)
      const summaryResponse = await aiService.summarizeTicket(ticketId.toString(), messageData);

      res.json(summaryResponse);
    } catch (error) {
      console.error('[AI Proxy] Summarize error:', error);
      res.status(500).json({
        error: 'Failed to generate summary',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * POST /tickets/:id/ai/draft-reply
 * Generate AI draft reply for ticket (STAFF ONLY)
 */
router.post(
  '/tickets/:id/ai/draft-reply',
  requireStaff,
  validateBody(aiDraftReplySchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const ticketId = req.params.id;
      const { messages, tone } = req.body;

      // Verify ticket exists
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      // If no messages provided in body, fetch from database
      let messageData = messages;
      if (!messages || messages.length === 0) {
        const dbMessages = await TicketMessage.find({ ticketId })
          .sort({ createdAt: 1 })
          .lean();
        messageData = dbMessages.map((msg) => ({
          senderRole: msg.senderRole,
          senderName: msg.senderName,
          body: msg.body,
          createdAt: msg.createdAt.toISOString(),
        }));
      }

      // Call AI service (falls back to stubs if unavailable)
      const draftResponse = await aiService.draftReply(ticketId.toString(), messageData, tone || 'professional');

      res.json(draftResponse);
    } catch (error) {
      console.error('[AI Proxy] Draft reply error:', error);
      res.status(500).json({
        error: 'Failed to generate draft reply',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * POST /tickets/:id/ai/suggest-steps
 * Generate suggested next steps for a ticket (STAFF ONLY)
 */
router.post(
  '/tickets/:id/ai/suggest-steps',
  requireStaff,
  validateBody(aiSuggestStepsSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const ticketId = req.params.id;
      const { messages } = req.body;

      // Verify ticket exists
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      // If no messages provided in body, fetch from database
      let messageData = messages;
      if (!messages || messages.length === 0) {
        const dbMessages = await TicketMessage.find({ ticketId })
          .sort({ createdAt: 1 })
          .lean();
        messageData = dbMessages.map((msg) => ({
          senderRole: msg.senderRole,
          senderName: msg.senderName,
          body: msg.body,
          createdAt: msg.createdAt.toISOString(),
        }));
      }

      // Call AI service (falls back to stubs if unavailable)
      const stepsResponse = await aiService.suggestSteps(ticketId.toString(), messageData);

      res.json(stepsResponse);
    } catch (error) {
      console.error('[AI Proxy] Suggest steps error:', error);
      res.status(500).json({
        error: 'Failed to generate suggested steps',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
