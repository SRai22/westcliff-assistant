/**
 * Knowledge Base Articles Routes
 * 
 * Read-only routes for all authenticated users.
 * Supports filtering by category and text search.
 */

import express, { Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { articleQuerySchema } from '../validation/schemas.js';
import { Article } from '../models/index.js';
import type { ArticleQueryInput } from '../validation/schemas.js';

const router = express.Router();

/**
 * GET /articles
 * Lists published articles with optional filtering
 * Supports: category filter, text search, pagination
 * Available to all authenticated users
 */
router.get(
  '/',
  requireAuth,
  validate(articleQuerySchema, 'query'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const query = req.query as unknown as ArticleQueryInput;

      // Build filter - only show published articles
      const filter: any = { isPublished: true };

      // Apply category filter
      if (query.category) {
        filter.category = query.category;
      }

      // Apply tags filter (comma-separated)
      if (query.tags) {
        const tagsArray = query.tags.split(',').map((tag) => tag.trim());
        filter.tags = { $in: tagsArray };
      }

      // Build search query if provided
      let searchFilter = filter;
      if (query.search) {
        searchFilter = {
          ...filter,
          $text: { $search: query.search },
        };
      }

      // Pagination
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;

      // Execute query
      const [articles, total] = await Promise.all([
        Article.find(searchFilter)
          .select('-__v')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Article.countDocuments(searchFilter),
      ]);

      res.json({
        articles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /articles/:id
 * Retrieves a single published article by ID
 * Increments view count
 * Available to all authenticated users
 */
router.get(
  '/:id',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Find and increment view count
      const article = await Article.findOneAndUpdate(
        { _id: id, isPublished: true },
        { $inc: { viewCount: 1 } },
        { new: true, select: '-__v' }
      ).lean();

      if (!article) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }

      res.json({ article });
    } catch (error) {
      console.error('Error fetching article:', error);
      
      // Handle invalid ObjectId
      if (error instanceof Error && error.name === 'CastError') {
        res.status(404).json({ error: 'Article not found' });
        return;
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
