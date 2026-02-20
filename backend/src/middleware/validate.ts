/**
 * Validation middleware factory using Zod schemas
 * Returns structured errors on validation failure
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';

/**
 * Validation target - where to find the data to validate
 */
export type ValidationSource = 'body' | 'query' | 'params';

/**
 * Middleware factory that validates request data against a Zod schema
 * 
 * @param schema - Zod schema to validate against
 * @param source - Where to get the data from (body, query, or params)
 * @returns Express middleware function
 * 
 * @example
 * router.post('/tickets', validate(createTicketSchema, 'body'), createTicket);
 * router.get('/articles', validate(articleQuerySchema, 'query'), getArticles);
 */
export const validate = (
  schema: ZodSchema,
  source: ValidationSource = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Get the data to validate based on source
      const data = req[source];

      // Validate the data against the schema
      const validated = schema.parse(data);

      // Replace the original data with validated (and potentially transformed) data
      req[source] = validated;

      // Continue to next middleware
      next();
    } catch (error) {
      // Handle validation errors
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
        });
        return;
      }

      // Handle unexpected errors
      console.error('Unexpected validation error:', error);
      res.status(500).json({
        error: 'Internal server error during validation',
      });
    }
  };
};

/**
 * Convenience function for validating request body
 * @param schema - Zod schema to validate against
 */
export const validateBody = (schema: ZodSchema) => validate(schema, 'body');

/**
 * Convenience function for validating query parameters
 * @param schema - Zod schema to validate against
 */
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');

/**
 * Convenience function for validating URL parameters
 * @param schema - Zod schema to validate against
 */
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');
