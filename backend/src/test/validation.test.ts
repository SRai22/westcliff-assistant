/**
 * Test script to verify validation schemas and middleware
 * Run with: tsx src/test/validation.test.ts
 */

import { z } from 'zod';
import {
  createTicketSchema,
  updateTicketStatusSchema,
  createMessageSchema,
  articleQuerySchema,
  loginSchema,
} from '../validation/schemas.js';
import { CATEGORIES, TICKET_STATUSES, PRIORITIES } from '../constants.js';

console.log('Testing Validation Schemas...\n');

// Test 1: Verify constants are correct
console.log('Test 1: Verify constants match CLAUDE.md specifications');
console.log('  - Categories count:', CATEGORIES.length, '(expected: 11)');
console.log('  - Ticket statuses count:', TICKET_STATUSES.length, '(expected: 4)');
console.log('  - Priorities count:', PRIORITIES.length, '(expected: 3)');

if (CATEGORIES.length === 11) {
  console.log('  [PASS] 11 categories defined');
} else {
  console.log('  [FAIL] Expected 11 categories, got', CATEGORIES.length);
}

if (TICKET_STATUSES.length === 4) {
  console.log('  [PASS] 4 ticket statuses defined');
} else {
  console.log('  [FAIL] Expected 4 statuses, got', TICKET_STATUSES.length);
}

if (PRIORITIES.length === 3) {
  console.log('  [PASS] 3 priorities defined');
} else {
  console.log('  [FAIL] Expected 3 priorities, got', PRIORITIES.length);
}

// Test 2: Valid login request
console.log('\nTest 2: Valid login request');
try {
  const validLogin = loginSchema.parse({
    idToken: 'valid-google-id-token-here',
  });
  console.log('  [PASS] Login schema accepts valid token');
} catch (error) {
  console.log('  [FAIL] Login schema rejected valid token:', error);
}

// Test 3: Invalid login request
console.log('\nTest 3: Invalid login request (missing token)');
try {
  loginSchema.parse({});
  console.log('  [FAIL] Login schema should reject missing token');
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log('  [PASS] Login schema correctly rejects missing token');
    console.log('    Error:', error.issues[0].message);
  }
}

// Test 4: Valid ticket creation
console.log('\nTest 4: Valid ticket creation');
try {
  const validTicket = createTicketSchema.parse({
    category: 'Information Technology',
    priority: 'MEDIUM',
    summary: 'Cannot access my email account',
    description: 'I have been trying to log in to my email but keep getting an error message.',
  });
  console.log('  [PASS] Ticket schema accepts valid ticket data');
} catch (error) {
  console.log('  [FAIL] Ticket schema rejected valid data:', error);
}

// Test 5: Invalid ticket (invalid category)
console.log('\nTest 5: Invalid ticket (invalid category)');
try {
  createTicketSchema.parse({
    category: 'INVALID_CATEGORY',
    priority: 'MEDIUM',
    summary: 'Test ticket',
    description: 'This should fail validation',
  });
  console.log('  [FAIL] Ticket schema should reject invalid category');
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log('  [PASS] Ticket schema correctly rejects invalid category');
    console.log('    Error:', error.issues[0].message);
  }
}

// Test 6: Invalid ticket (invalid status)
console.log('\nTest 6: Invalid ticket status update (invalid status)');
try {
  updateTicketStatusSchema.parse({
    status: 'INVALID_STATUS',
  });
  console.log('  [FAIL] Status schema should reject invalid status');
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log('  [PASS] Status schema correctly rejects invalid status');
    console.log('    Error:', error.issues[0].message);
  }
}

// Test 7: Valid status update
console.log('\nTest 7: Valid status update');
try {
  const validStatus = updateTicketStatusSchema.parse({
    status: 'IN_PROGRESS',
    reason: 'Starting work on this ticket',
  });
  console.log('  [PASS] Status schema accepts valid status');
} catch (error) {
  console.log('  [FAIL] Status schema rejected valid status:', error);
}

// Test 8: Invalid message (empty body)
console.log('\nTest 8: Invalid message (empty body)');
try {
  createMessageSchema.parse({
    body: '',
  });
  console.log('  [FAIL] Message schema should reject empty body');
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log('  [PASS] Message schema correctly rejects empty body');
    console.log('    Error:', error.issues[0].message);
  }
}

// Test 9: Valid message
console.log('\nTest 9: Valid message');
try {
  const validMessage = createMessageSchema.parse({
    body: 'Thank you for your assistance!',
    isInternalNote: false,
  });
  console.log('  [PASS] Message schema accepts valid message');
} catch (error) {
  console.log('  [FAIL] Message schema rejected valid message:', error);
}

// Test 10: Query parameter transformation
console.log('\nTest 10: Query parameter transformation (pagination)');
try {
  const queryParams = articleQuerySchema.parse({
    page: '2',
    limit: '25',
    isPublished: 'true',
  });
  console.log('  [PASS] Query schema transforms string params to correct types');
  console.log('    page:', queryParams.page, '(type:', typeof queryParams.page, ')');
  console.log('    limit:', queryParams.limit, '(type:', typeof queryParams.limit, ')');
  console.log('    isPublished:', queryParams.isPublished, '(type:', typeof queryParams.isPublished, ')');
} catch (error) {
  console.log('  [FAIL] Query schema rejected valid params:', error);
}

// Test 11: Ticket summary length validation
console.log('\nTest 11: Ticket summary length validation');
try {
  createTicketSchema.parse({
    category: 'Information Technology',
    priority: 'HIGH',
    summary: 'Hi',  // Too short
    description: 'This is a valid description with enough characters.',
  });
  console.log('  [FAIL] Should reject summary that is too short');
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log('  [PASS] Correctly rejects summary that is too short');
    console.log('    Error:', error.issues[0].message);
  }
}

// Test 12: Error structure validation
console.log('\nTest 12: Error structure (details array)');
try {
  createTicketSchema.parse({
    category: 'INVALID',
    priority: 'INVALID',
    summary: 'Hi',
    description: 'Too short',
  });
  console.log('  [FAIL] Should reject multiple invalid fields');
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log('  [PASS] Multiple validation errors detected');
    console.log('    Number of errors:', error.issues.length);
    error.issues.forEach((issue, index) => {
      console.log(`    Error ${index + 1}: ${issue.path.join('.')} - ${issue.message}`);
    });
  }
}

console.log('\nAll validation tests completed!\n');
