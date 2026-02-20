import mongoose, { Document, Schema, Types } from 'mongoose';
import { UserRole } from './User.js';

export interface ITicketMessage extends Document {
  ticketId: Types.ObjectId;
  senderRole: UserRole;
  senderName: string;
  body: string;
  isInternalNote: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ticketMessageSchema = new Schema<ITicketMessage>(
  {
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    isInternalNote: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries by ticket
ticketMessageSchema.index({ ticketId: 1, createdAt: 1 });

export const TicketMessage = mongoose.model<ITicketMessage>(
  'TicketMessage',
  ticketMessageSchema
);
