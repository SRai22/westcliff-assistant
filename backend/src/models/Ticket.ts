import mongoose, { Document, Schema, Types } from 'mongoose';

export enum TicketStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING = 'WAITING',
  RESOLVED = 'RESOLVED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum TicketCategory {
  INFORMATION_TECHNOLOGY = 'Information Technology',
  LEARNING_TECHNOLOGIES = 'Learning Technologies',
  STUDENT_SERVICES = 'Student Services',
  INTERNATIONAL_AFFAIRS = 'International Affairs',
  REGISTRAR = 'Registrar',
  STUDENT_ACCOUNTS = 'Student Accounts',
  FINANCIAL_AID = 'Financial Aid',
  ALUMNI_AFFAIRS_AND_CAREER_SERVICES = 'Alumni Affairs and Career Services',
  MILITARY_VETERANS = 'Military / Veterans',
  STUDENT_LIFE = 'Student Life',
  LEARNING_EXPERIENCE_DESIGN = 'Learning Experience Design (LXD) Team',
}

export interface IAttachment {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface ITicket extends Document {
  studentId: Types.ObjectId;
  category: TicketCategory;
  service?: string;
  priority: TicketPriority;
  status: TicketStatus;
  summary: string;
  description: string;
  assigneeId?: Types.ObjectId;
  attachments: IAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema<IAttachment>(
  {
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ticketSchema = new Schema<ITicket>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: Object.values(TicketCategory),
      required: true,
    },
    service: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: Object.values(TicketPriority),
      required: true,
      default: TicketPriority.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(TicketStatus),
      required: true,
      default: TicketStatus.NEW,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
ticketSchema.index({ studentId: 1, status: 1 });
ticketSchema.index({ assigneeId: 1, status: 1 });
ticketSchema.index({ category: 1, status: 1 });

export const Ticket = mongoose.model<ITicket>('Ticket', ticketSchema);
