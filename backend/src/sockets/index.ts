/**
 * Socket.io Handler
 * Manages real-time WebSocket connections for ticket messages
 * 
 * Features:
 * - Session-based authentication
 * - Room management per ticket
 * - RBAC enforcement (students only join their own tickets)
 * - Real-time message broadcasting
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { sessionMiddleware } from '../config/session.js';
import { User, Ticket } from '../models/index.js';
import { env } from '../config/env.js';

// Extend Socket interface to include session and user data
interface AuthenticatedSocket extends Socket {
  request: Socket['request'] & {
    session?: {
      userId?: string;
    };
    sessionID?: string;
  };
  userId?: string;
  userRole?: string;
}

/**
 * Initialize Socket.io server with Express session integration
 */
export function initializeSocketIO(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    // Session-based authentication
    allowRequest: async (req, callback) => {
      // Wrap session middleware for socket.io
      sessionMiddleware(req as any, {} as any, () => {
        callback(null, true);
      });
    },
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const session = socket.request.session;
      
      if (!session || !session.userId) {
        console.log('[Socket.io] Rejected: No session or userId');
        return next(new Error('Authentication required'));
      }

      // Fetch user from database
      const user = await User.findById(session.userId);
      if (!user) {
        console.log('[Socket.io] Rejected: User not found');
        return next(new Error('User not found'));
      }

      // Attach user info to socket
      socket.userId = user._id.toString();
      socket.userRole = user.role;

      console.log(`[Socket.io] Authenticated: ${user.email} (${user.role})`);
      next();
    } catch (error) {
      console.error('[Socket.io] Authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`[Socket.io] Client connected: ${socket.userId} (${socket.userRole})`);

    /**
     * Join a ticket room for real-time updates
     * Students can only join their own tickets
     * Staff can join any ticket
     */
    socket.on('join-ticket', async (ticketId: string) => {
      try {
        // Validate ticket exists
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
          socket.emit('error', { message: 'Ticket not found' });
          return;
        }

        // RBAC check: students can only join their own tickets
        if (socket.userRole === 'STUDENT') {
          if (ticket.studentId.toString() !== socket.userId) {
            socket.emit('error', { message: 'Access denied' });
            console.log(
              `[Socket.io] Access denied: Student ${socket.userId} tried to join ticket ${ticketId}`
            );
            return;
          }
        }

        // Join the room
        const roomName = `ticket:${ticketId}`;
        socket.join(roomName);
        console.log(`[Socket.io] User ${socket.userId} joined room: ${roomName}`);

        // Confirm join
        socket.emit('joined-ticket', { ticketId, room: roomName });
      } catch (error) {
        console.error('[Socket.io] Error joining ticket room:', error);
        socket.emit('error', { message: 'Failed to join ticket room' });
      }
    });

    /**
     * Leave a ticket room
     */
    socket.on('leave-ticket', (ticketId: string) => {
      const roomName = `ticket:${ticketId}`;
      socket.leave(roomName);
      console.log(`[Socket.io] User ${socket.userId} left room: ${roomName}`);
      socket.emit('left-ticket', { ticketId, room: roomName });
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.userId}`);
    });

    /**
     * Handle errors
     */
    socket.on('error', (error) => {
      console.error('[Socket.io] Socket error:', error);
    });
  });

  return io;
}

/**
 * Broadcast a new message to all clients in a ticket room
 */
export function broadcastMessage(
  io: SocketIOServer,
  ticketId: string,
  message: {
    id: string;
    ticketId: string;
    senderRole: string;
    senderName: string;
    body: string;
    isInternalNote: boolean;
    createdAt: string;
  }
) {
  const roomName = `ticket:${ticketId}`;
  
  // For internal notes, we need to filter recipients by role
  // Since Socket.io rooms don't have role filters, we emit to the room
  // and clients filter on their end, OR we can iterate through sockets
  if (message.isInternalNote) {
    // Only emit to staff members in the room
    const sockets = io.sockets.adapter.rooms.get(roomName);
    if (sockets) {
      sockets.forEach((socketId) => {
        const socket = io.sockets.sockets.get(socketId) as AuthenticatedSocket;
        if (socket && socket.userRole === 'STAFF') {
          socket.emit('new-message', message);
        }
      });
    }
    console.log(`[Socket.io] Broadcasted internal note to staff in room: ${roomName}`);
  } else {
    // Public message - emit to everyone in the room
    io.to(roomName).emit('new-message', message);
    console.log(`[Socket.io] Broadcasted message to room: ${roomName}`);
  }
}

/**
 * Broadcast a ticket status change
 */
export function broadcastStatusChange(
  io: SocketIOServer,
  ticketId: string,
  data: {
    ticketId: string;
    oldStatus: string;
    newStatus: string;
    changedBy: string;
    changedAt: string;
  }
) {
  const roomName = `ticket:${ticketId}`;
  io.to(roomName).emit('status-changed', data);
  console.log(`[Socket.io] Broadcasted status change to room: ${roomName}`);
}
