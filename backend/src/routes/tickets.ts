/**
 * Ticket CRUD Routes
 * 
 * Handles listing, retrieving, and creating tickets with proper RBAC.
 * Students can only see/access their own tickets.
 * Staff can see/access all tickets.
 */

import express, { Request, Response } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { requireAuth, requireStaff } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTicketSchema, ticketQuerySchema, updateTicketStatusSchema, createMessageSchema } from '../validation/schemas.js';
import {
  Ticket,
  TicketMessage,
  TicketStatusHistory,
  AuditLog,
  TicketStatus,
  UserRole,
  AuditAction,
} from '../models/index.js';
import type { CreateTicketInput, TicketQueryInput, UpdateTicketStatusInput, CreateMessageInput } from '../validation/schemas.js';
/*import { isValidStatusTransition } from '../services/ticketTransitions.js'; Ningmo Liu*/

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

      // Broadcast new message via Socket.io
      const io: SocketIOServer = req.app.get('io');
      if (io) {
        const { broadcastMessage } = await import('../sockets/index.js');
        broadcastMessage(io, ticket._id.toString(), {
          id: message._id.toString(),
          ticketId: ticket._id.toString(),
          senderRole: message.senderRole,
          senderName: message.senderName,
          body: message.body,
          isInternalNote: message.isInternalNote,
          createdAt: message.createdAt.toISOString(),
        });
      }

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

/**
 * PATCH /tickets/:id/status
 * Updates ticket status (staff only)
 * Creates TicketStatusHistory and AuditLog entries
 */
router.patch(
  '/:id/status',
  requireStaff,
  validate(updateTicketStatusSchema, 'body'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body as UpdateTicketStatusInput;
      const user = req.user!;

      // Find the ticket
      const ticket = await Ticket.findById(id);

      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      /* Validate transition - Ningmo Liu: 
      Adds business-level validation for ticket status transitions.

      Prevents invalid state changes (e.g., RESOLVED → NEW) 
      by enforcing an explicit transition map.

      This improves data integrity and aligns ticket workflow 
      with real-world helpdesk lifecycle management.*/
      /*if (!isValidStatusTransition(fromStatus, toStatus)) {
        res.status(400).json({
          error: 'Invalid status transition',
          message: `Cannot change status from ${fromStatus} to ${toStatus}`,
        });
        return;
      }*/

      // Save old status for history
      const fromStatus = ticket.status;
      const toStatus = data.status as TicketStatus;

      // Update ticket status
      ticket.status = toStatus;
      await ticket.save();

      // Create status history entry
      await TicketStatusHistory.create({
        ticketId: ticket._id,
        fromStatus,
        toStatus,
        changedBy: user._id,
        changedByName: user.name,
        reason: data.reason || undefined,
      });

      // Create audit log entry
      await AuditLog.create({
        action: AuditAction.TICKET_STATUS_CHANGED,
        userId: user._id,
        userName: user.name,
        ticketId: ticket._id,
        details: {
          fromStatus,
          toStatus,
          reason: data.reason,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      // Broadcast status change via Socket.io
      const io: SocketIOServer = req.app.get('io');
      if (io) {
        const { broadcastStatusChange } = await import('../sockets/index.js');
        broadcastStatusChange(io, id.toString(), {
          ticketId: id.toString(),
          oldStatus: fromStatus,
          newStatus: toStatus,
          changedBy: user.name,
          changedAt: new Date().toISOString(),
        });
      }

      res.json({
        message: 'Ticket status updated successfully',
        ticket: {
          id: ticket._id,
          status: ticket.status,
          updatedAt: ticket.updatedAt,
        },
      });
    } catch (error) {
      console.error('Error updating ticket status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /tickets/:id/messages
 * Lists messages for a ticket
 * Students: can only view messages on their own tickets, excluding internal notes
 * Staff: can view all messages including internal notes on any ticket
 */
router.get(
  '/:id/messages',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = req.user!;

      // Find the ticket to check ownership
      const ticket = await Ticket.findById(id).lean();

      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      // Students can only view messages on their own tickets
      if (user.role === UserRole.STUDENT && ticket.studentId.toString() !== user._id.toString()) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      // Build query filter
      const filter: any = { ticketId: id };

      // Students cannot see internal notes
      if (user.role === UserRole.STUDENT) {
        filter.isInternalNote = false;
      }

      // Fetch messages
      const messages = await TicketMessage.find(filter)
        .sort({ createdAt: 1 })
        .lean();

      res.json({ messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /tickets/:id/messages
 * Creates a new message on a ticket
 * Students: can only message their own tickets, cannot create internal notes
 * Staff: can message any ticket and create internal notes
 * Updates the parent ticket's updatedAt timestamp
 */
router.post(
  '/:id/messages',
  requireAuth,
  validate(createMessageSchema, 'body'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body as CreateMessageInput;
      const user = req.user!;

      // Find the ticket
      const ticket = await Ticket.findById(id);

      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      // Students can only message their own tickets
      if (user.role === UserRole.STUDENT && ticket.studentId.toString() !== user._id.toString()) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Students cannot create internal notes (silently ignore if they try)
      const isInternalNote = user.role === UserRole.STAFF ? (data.isInternalNote || false) : false;

      // Create the message
      const message = await TicketMessage.create({
        ticketId: id,
        senderRole: user.role,
        senderName: user.name,
        body: data.body,
        isInternalNote,
      });

      // Broadcast new message via Socket.io
      const io: SocketIOServer = req.app.get('io');
      if (io) {
        const { broadcastMessage } = await import('../sockets/index.js');
        broadcastMessage(io, id.toString(), {
          id: message._id.toString(),
          ticketId: id.toString(),
          senderRole: message.senderRole,
          senderName: message.senderName,
          body: message.body,
          isInternalNote: message.isInternalNote,
          createdAt: message.createdAt.toISOString(),
        });
      }

      // Update ticket's updatedAt timestamp
      ticket.updatedAt = new Date();
      await ticket.save();

      // Create audit log entry
      await AuditLog.create({
        action: AuditAction.MESSAGE_ADDED,
        userId: user._id,
        userName: user.name,
        ticketId: ticket._id,
        details: {
          isInternalNote,
          messageLength: data.body.length,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        message: 'Message added successfully',
        data: {
          id: message._id,
          senderRole: message.senderRole,
          senderName: message.senderName,
          body: message.body,
          isInternalNote: message.isInternalNote,
          createdAt: message.createdAt,
        },
      });
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
