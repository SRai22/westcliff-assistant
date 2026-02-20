/**
 * Ticket CRUD Routes
 * 
 * Handles listing, retrieving, and creating tickets with proper RBAC.
 * Students can only see/access their own tickets.
 * Staff can see/access all tickets.
 */

import express, { Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTicketSchema, ticketQuerySchema } from '../validation/schemas.js';
import {
  Ticket,
  TicketMessage,
  TicketStatusHistory,
  AuditLog,
  TicketStatus,
  UserRole,
  AuditAction,
} from '../models/index.js';
import type { CreateTicketInput, TicketQueryInput } from '../validation/schemas.js';

const router = express.Router();

/**
 * GET /tickets
 * Lists tickets with role-based filtering
 * Students: only their own tickets
 * Staff: all tickets
 * Supports query params: status, category, priority, page, limit
 */
router.get(
  '/',
  requireAuth,
  validate(ticketQuerySchema, 'query'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const query = req.query as unknown as TicketQueryInput;
      const user = req.user!;

      // Build filter
      const filter: any = {};

      // Role-based filtering: students see only their own tickets
      if (user.role === UserRole.STUDENT) {
        filter.studentId = user._id;
      }

      // Apply optional query filters
      if (query.status) filter.status = query.status;
      if (query.category) filter.category = query.category;
      if (query.priority) filter.priority = query.priority;
      if (query.assigneeId) filter.assigneeId = query.assigneeId;

      // Pagination
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;

      // Execute query
      const [tickets, total] = await Promise.all([
        Ticket.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Ticket.countDocuments(filter),
      ]);

      res.json({
        tickets,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching tickets:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /tickets/:id
 * Retrieves a single ticket
 * Students: can only view their own (404 otherwise)
 * Staff: can view any ticket
 */
router.get(
  '/:id',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = req.user!;

      const ticket = await Ticket.findById(id).lean();

      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      // Students can only view their own tickets
      if (user.role === UserRole.STUDENT && ticket.studentId.toString() !== user._id.toString()) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      res.json({ ticket });
    } catch (error) {
      console.error('Error fetching ticket:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /tickets/intake/confirm
 * Creates a new ticket along with:
 * - Initial TicketMessage (from STUDENT)
 * - TicketStatusHistory (to NEW status)
 * - AuditLog (TICKET_CREATED action)
 */
router.post(
  '/intake/confirm',
  requireAuth,
  validate(createTicketSchema, 'body'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body as CreateTicketInput;
      const user = req.user!;

      // Create the ticket
      const ticket = await Ticket.create({
        studentId: user._id,
        category: data.category,
        service: data.service,
        priority: data.priority,
        status: TicketStatus.NEW,
        summary: data.summary,
        description: data.description,
        attachments: data.attachments || [],
      });

      // Create initial message (from student)
      const message = await TicketMessage.create({
        ticketId: ticket._id,
        senderRole: UserRole.STUDENT,
        senderName: user.name,
        body: data.description,
        isInternalNote: false,
      });

      // Create status history entry (to NEW)
      const statusHistory = await TicketStatusHistory.create({
        ticketId: ticket._id,
        fromStatus: TicketStatus.NEW, // First status, so from=to
        toStatus: TicketStatus.NEW,
        changedBy: user._id,
        changedByName: user.name,
        reason: 'Ticket created',
      });

      // Create audit log entry
      const auditLog = await AuditLog.create({
        action: AuditAction.TICKET_CREATED,
        userId: user._id,
        userName: user.name,
        ticketId: ticket._id,
        details: {
          category: data.category,
          priority: data.priority,
          summary: data.summary,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        message: 'Ticket created successfully',
        ticket: {
          id: ticket._id,
          category: ticket.category,
          priority: ticket.priority,
          status: ticket.status,
          summary: ticket.summary,
          createdAt: ticket.createdAt,
        },
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
