/**
 * Test script to verify validation middleware
 * Run with: tsx src/test/middleware.test.ts
 */

import { Request, Response, NextFunction } from 'express';
import { validate } from '../middleware/validate.js';
import { createTicketSchema } from '../validation/schemas.js';

console.log('Testing Validation Middleware...\n');

// Mock Express objects
const createMockRequest = (body: any): Partial<Request> => ({
  body,
  query: {},
  params: {},
});

const createMockResponse = (): Partial<Response> & {
  statusCode: number;
  jsonData: any;
} => {
  const res: any = {
    statusCode: 200,
    jsonData: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.jsonData = data;
      return this;
    },
  };
  return res;
};

const mockNext: NextFunction = () => {
  console.log('  - next() was called');
};

// Test 1: Valid request passes validation
console.log('Test 1: Valid request should call next()');
const validReq = createMockRequest({
  category: 'Information Technology',
  priority: 'HIGH',
  summary: 'Cannot access email',
  description: 'I have been unable to access my email account since yesterday.',
});
const validRes = createMockResponse();

const middleware1 = validate(createTicketSchema, 'body');
middleware1(validReq as Request, validRes as Response, mockNext);

if (validRes.statusCode === 200 && !validRes.jsonData) {
  console.log('  [PASS] Valid request passes validation and calls next()');
} else {
  console.log('  [FAIL] Valid request did not pass validation');
  console.log('    Status:', validRes.statusCode);
  console.log('    Response:', validRes.jsonData);
}

// Test 2: Invalid request returns 400 with structured errors
console.log('\nTest 2: Invalid request should return 400 with error details');
const invalidReq = createMockRequest({
  category: 'INVALID_CATEGORY',
  priority: 'HIGH',
  summary: 'Hi',  // Too short
  description: 'Short',  // Too short
});
const invalidRes = createMockResponse();

const middleware2 = validate(createTicketSchema, 'body');
middleware2(invalidReq as Request, invalidRes as Response, mockNext);

if (invalidRes.statusCode === 400) {
  console.log('  [PASS] Invalid request returns 400 status code');
} else {
  console.log('  [FAIL] Expected 400, got', invalidRes.statusCode);
}

if (invalidRes.jsonData && invalidRes.jsonData.error) {
  console.log('  [PASS] Response includes error field');
  console.log('    Error message:', invalidRes.jsonData.error);
} else {
  console.log('  [FAIL] Response missing error field');
}

if (invalidRes.jsonData && Array.isArray(invalidRes.jsonData.details)) {
  console.log('  [PASS] Response includes details array');
  console.log('    Number of validation errors:', invalidRes.jsonData.details.length);
  invalidRes.jsonData.details.forEach((detail: any, index: number) => {
    console.log(`    Error ${index + 1}: ${detail.path} - ${detail.message}`);
  });
} else {
  console.log('  [FAIL] Response missing details array');
}

// Test 3: Verify error structure matches spec
console.log('\nTest 3: Error structure matches specification');
if (
  invalidRes.jsonData &&
  invalidRes.jsonData.error &&
  Array.isArray(invalidRes.jsonData.details)
) {
  const hasRequiredFields = invalidRes.jsonData.details.every(
    (detail: any) => 
      typeof detail.path === 'string' &&
      typeof detail.message === 'string' &&
      typeof detail.code === 'string'
  );
  
  if (hasRequiredFields) {
    console.log('  [PASS] Error details have required fields (path, message, code)');
  } else {
    console.log('  [FAIL] Error details missing required fields');
  }
} else {
  console.log('  [FAIL] Cannot verify error structure');
}

// Test 4: Missing required field
console.log('\nTest 4: Missing required fields');
const missingFieldReq = createMockRequest({
  priority: 'HIGH',
  // Missing category, summary, and description
});
const missingFieldRes = createMockResponse();

const middleware3 = validate(createTicketSchema, 'body');
middleware3(missingFieldReq as Request, missingFieldRes as Response, mockNext);

if (missingFieldRes.statusCode === 400) {
  console.log('  [PASS] Missing required fields returns 400');
  console.log('    Number of errors:', missingFieldRes.jsonData.details.length);
} else {
  console.log('  [FAIL] Should return 400 for missing fields');
}

console.log('\nAll middleware tests completed!\n');
