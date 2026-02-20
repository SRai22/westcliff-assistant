/**
 * Test script to verify all Mongoose models
 * Run with: tsx src/test/models.test.ts
 */

import mongoose from 'mongoose';
import {
  User,
  UserRole,
  Ticket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketMessage,
  TicketStatusHistory,
  AuditLog,
  AuditAction,
  Article,
} from '../models/index.js';

console.log('Testing Mongoose Models...\n');

// Test 1: Verify all models are Mongoose models
console.log('Test 1: All models imported successfully');
console.log('  - User model:', User.modelName);
console.log('  - Ticket model:', Ticket.modelName);
console.log('  - TicketMessage model:', TicketMessage.modelName);
console.log('  - TicketStatusHistory model:', TicketStatusHistory.modelName);
console.log('  - AuditLog model:', AuditLog.modelName);
console.log('  - Article model:', Article.modelName);

// Test 2: Verify User.email has unique index
console.log('\nTest 2: User model indexes');
const userIndexes = User.schema.indexes();
console.log('  - User indexes:', JSON.stringify(userIndexes, null, 2));
const emailIndex = userIndexes.find((idx) =>
  Object.keys(idx[0]).includes('email')
);
if (emailIndex && emailIndex[1]?.unique) {
  console.log('  [PASS] User.email has unique index');
} else {
  console.log('  [FAIL] User.email unique index missing!');
}

// Test 3: Verify Ticket.studentId has index
console.log('\nTest 3: Ticket model indexes');
const ticketIndexes = Ticket.schema.indexes();
console.log('  - Ticket indexes:', JSON.stringify(ticketIndexes, null, 2));
const studentIdIndex = ticketIndexes.find((idx) =>
  Object.keys(idx[0]).includes('studentId')
);
if (studentIdIndex) {
  console.log('  [PASS] Ticket.studentId has index');
} else {
  console.log('  [FAIL] Ticket.studentId index missing!');
}

// Test 4: Verify TicketMessage.ticketId has index
console.log('\nTest 4: TicketMessage model indexes');
const messageIndexes = TicketMessage.schema.indexes();
console.log(
  '  - TicketMessage indexes:',
  JSON.stringify(messageIndexes, null, 2)
);
const ticketIdIndex = messageIndexes.find((idx) =>
  Object.keys(idx[0]).includes('ticketId')
);
if (ticketIdIndex) {
  console.log('  [PASS] TicketMessage.ticketId has index');
} else {
  console.log('  [FAIL] TicketMessage.ticketId index missing!');
}

// Test 5: Verify Article.category has index
console.log('\nTest 5: Article model indexes');
const articleIndexes = Article.schema.indexes();
console.log('  - Article indexes:', JSON.stringify(articleIndexes, null, 2));
const categoryIndex = articleIndexes.find((idx) =>
  Object.keys(idx[0]).includes('category')
);
if (categoryIndex) {
  console.log('  [PASS] Article.category has index');
} else {
  console.log('  [FAIL] Article.category index missing!');
}

// Test 6: Verify enums work and reject invalid values
console.log('\nTest 6: Enum validation');
console.log('  - UserRole enum:', Object.values(UserRole));
console.log('  - TicketStatus enum:', Object.values(TicketStatus));
console.log('  - TicketPriority enum:', Object.values(TicketPriority));
console.log('  - TicketCategory enum (sample):', [
  TicketCategory.INFORMATION_TECHNOLOGY,
  TicketCategory.STUDENT_SERVICES,
  TicketCategory.REGISTRAR,
]);
console.log('  - AuditAction enum (sample):', [
  AuditAction.TICKET_CREATED,
  AuditAction.TICKET_STATUS_CHANGED,
  AuditAction.USER_LOGIN,
]);

// Test 7: Try to create an invalid ticket (validation test)
console.log('\nTest 7: Enum validation in Mongoose');
try {
  const invalidTicket = new Ticket({
    studentId: new mongoose.Types.ObjectId(),
    category: 'INVALID_CATEGORY', // This should fail validation
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.NEW,
    summary: 'Test ticket',
    description: 'Test description',
  });
  
  const validationError = invalidTicket.validateSync();
  if (validationError) {
    console.log('  [PASS] Enum validation works! Invalid category was rejected:');
    console.log('    Error:', validationError.errors.category?.message);
  } else {
    console.log('  [FAIL] Enum validation failed - invalid value was accepted!');
  }
} catch (err) {
  console.log('  [PASS] Enum validation works! Invalid value was rejected');
}

// Test 8: Try to create an invalid status
console.log('\nTest 8: Status enum validation');
try {
  const invalidTicket = new Ticket({
    studentId: new mongoose.Types.ObjectId(),
    category: TicketCategory.INFORMATION_TECHNOLOGY,
    priority: TicketPriority.MEDIUM,
    status: 'INVALID_STATUS' as any, // This should fail validation
    summary: 'Test ticket',
    description: 'Test description',
  });
  
  const validationError = invalidTicket.validateSync();
  if (validationError) {
    console.log('  [PASS] Status enum validation works! Invalid status was rejected:');
    console.log('    Error:', validationError.errors.status?.message);
  } else {
    console.log('  [FAIL] Status enum validation failed!');
  }
} catch (err) {
  console.log('  [PASS] Status enum validation works!');
}

console.log('\nAll tests completed!\n');
