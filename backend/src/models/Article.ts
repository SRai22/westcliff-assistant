import mongoose, { Document, Schema } from 'mongoose';
import { TicketCategory } from './Ticket.js';

export interface IArticle extends Document {
  title: string;
  category: TicketCategory;
  summary: string;
  content: string;
  tags: string[];
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  isPublished: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const articleSchema = new Schema<IArticle>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      enum: Object.values(TicketCategory),
      required: true,
      index: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search functionality
articleSchema.index({ title: 'text', summary: 'text', content: 'text' });

// Compound indexes for efficient queries
articleSchema.index({ category: 1, isPublished: 1 });
articleSchema.index({ isPublished: 1, createdAt: -1 });

export const Article = mongoose.model<IArticle>('Article', articleSchema);
