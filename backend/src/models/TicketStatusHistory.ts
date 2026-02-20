import mongoose, { Document, Schema, Types } from 'mongoose';
import { TicketStatus } from './Ticket.js';

export interface ITicketStatusHistory extends Document {
  ticketId: Types.ObjectId;
  fromStatus: TicketStatus;
  toStatus: TicketStatus;
  changedBy: Types.ObjectId;
  changedByName: string;
  reason?: string;
  createdAt: Date;
}

const ticketStatusHistorySchema = new Schema<ITicketStatusHistory>(
  {
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
      index: true,
    },
    fromStatus: {
      type: String,
      enum: Object.values(TicketStatus),
      required: true,
    },
    toStatus: {
      type: String,
      enum: Object.values(TicketStatus),
      required: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changedByName: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index for retrieving history for a ticket
ticketStatusHistorySchema.index({ ticketId: 1, createdAt: -1 });

export const TicketStatusHistory = mongoose.model<ITicketStatusHistory>(
  'TicketStatusHistory',
  ticketStatusHistorySchema
);
