#!/usr/bin/env node

/**
 * Socket.io WebSocket Integration Tests
 * Tests real-time message broadcasting and authentication
 */

import { io as ioClient } from 'socket.io-client';
import axios from 'axios';

const BASE_URL = 'http://localhost:3001';
const COLORS = {
  RED: '\x1b[0;31m',
  GREEN: '\x1b[0;32m',
  YELLOW: '\x1b[1;33m',
  NC: '\x1b[0m', // No Color
};

let passed = 0;
let failed = 0;

function test(name, pass, message = '') {
  if (pass) {
    console.log(`${COLORS.GREEN}${COLORS.NC} ${name}`);
    if (message) console.log(`  ${message}`);
    passed++;
  } else {
    console.log(`${COLORS.RED}${COLORS.NC} ${name}`);
    if (message) console.log(`  ${message}`);
    failed++;
  }
}

async function createUser(email) {
  const response = await axios.post(`${BASE_URL}/auth/dev-login`, { email });
  const cookie = response.headers['set-cookie'][0];
  return { user: response.data, cookie };
}

async function createTicket(cookie, data) {
  const response = await axios.post(`${BASE_URL}/tickets/intake/confirm`, data, {
    headers: { Cookie: cookie },
  });
  return response.data.ticket;
}

async function postMessage(cookie, ticketId, body) {
  const response = await axios.post(`${BASE_URL}/tickets/${ticketId}/messages`, { body }, {
    headers: { Cookie: cookie },
  });
  return response.data;
}

console.log('=========================================');
console.log('Socket.io WebSocket Integration Tests');
console.log('=========================================\n');

async function main() {
  let studentCookie, staffCookie, studentTicketId;

  try {
    // Setup: Create users and a ticket
    console.log('--- Setup: Creating test users and ticket ---');
    
    const student = await createUser('socketstudent@example.com');
    studentCookie = student.cookie;
    console.log(`${COLORS.GREEN}${COLORS.NC} Student user created`);

    const staff = await createUser('socketstaff@westcliff.edu');
    staffCookie = staff.cookie;
    console.log(`${COLORS.GREEN}${COLORS.NC} Staff user created`);

    const ticket = await createTicket(studentCookie, {
      category: 'Information Technology',
      priority: 'MEDIUM',
      summary: 'Socket.io test ticket',
      description: 'Testing real-time updates',
      service: 'Testing',
    });
    studentTicketId = ticket.id;
    console.log(`${COLORS.GREEN}${COLORS.NC} Test ticket created: ${studentTicketId}\n`);

    // Test 1: Connect without authentication (should fail)
    console.log('--- WebSocket Connection Tests ---');
    
    await new Promise((resolve) => {
      const socket = ioClient(BASE_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });

      socket.on('connect_error', (error) => {
        test('Unauthenticated connection rejected', true, error.message);
        socket.disconnect();
        resolve();
      });

      socket.on('connect', () => {
        test('Unauthenticated connection rejected', false, 'Connection should have been rejected');
        socket.disconnect();
        resolve();
      });

      setTimeout(() => {
        socket.disconnect();
        resolve();
      }, 2000);
    });

    // Test 2: Connect with student authentication
    const studentSocket = await new Promise((resolve, reject) => {
      const socket = ioClient(BASE_URL, {
        extraHeaders: {
          Cookie: studentCookie,
        },
        transports: ['websocket'],
        autoConnect: true,
      });

      socket.on('connect', () => {
        test('Student can connect with valid session', true);
        resolve(socket);
      });

      socket.on('connect_error', (error) => {
        test('Student can connect with valid session', false, error.message);
        reject(error);
      });

      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });

    // Test 3: Connect with staff authentication
    const staffSocket = await new Promise((resolve, reject) => {
      const socket = ioClient(BASE_URL, {
        extraHeaders: {
          Cookie: staffCookie,
        },
        transports: ['websocket'],
        autoConnect: true,
      });

      socket.on('connect', () => {
        test('Staff can connect with valid session', true);
        resolve(socket);
      });

      socket.on('connect_error', (error) => {
        test('Staff can connect with valid session', false, error.message);
        reject(error);
      });

      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });

    console.log('');
    console.log('--- Room Management Tests ---');

    // Test 4: Student joins their own ticket room
    await new Promise((resolve) => {
      studentSocket.once('joined-ticket', (data) => {
        test('Student can join own ticket room', data.ticketId === studentTicketId, 
          `Joined room: ${data.room}`);
        resolve();
      });

      studentSocket.once('error', (data) => {
        test('Student can join own ticket room', false, data.message);
        resolve();
      });

      studentSocket.emit('join-ticket', studentTicketId);
    });

    // Test 5: Staff joins any ticket room
    await new Promise((resolve) => {
      staffSocket.once('joined-ticket', (data) => {
        test('Staff can join any ticket room', data.ticketId === studentTicketId, 
          `Joined room: ${data.room}`);
        resolve();
      });

      staffSocket.once('error', (data) => {
        test('Staff can join any ticket room', false, data.message);
        resolve();
      });

      staffSocket.emit('join-ticket', studentTicketId);
    });

    console.log('');
    console.log('--- Real-time Message Broadcasting Tests ---');

    // Test 6: Broadcast new message to all clients in room
    const messageReceived = new Promise((resolve) => {
      let studentReceived = false;
      let staffReceived = false;

      studentSocket.once('new-message', (message) => {
        studentReceived = true;
        if (staffReceived) resolve({ student: true, staff: true, message });
      });

      staffSocket.once('new-message', (message) => {
        staffReceived = true;
        if (studentReceived) resolve({ student: true, staff: true, message });
      });

      setTimeout(() => resolve({ student: studentReceived, staff: staffReceived }), 3000);
    });

    // Post a message via REST API
    await postMessage(studentCookie, studentTicketId, 'Testing real-time broadcast');

    const result = await messageReceived;
    test('Message broadcasted to student in room', result.student, 
      result.message ? `Received: ${result.message.body.substring(0, 50)}...` : '');
    test('Message broadcasted to staff in room', result.staff);

    // Test 7: Internal notes only visible to staff
    console.log('');
    console.log('--- Internal Note Broadcasting Tests ---');

    const internalNoteTest = new Promise((resolve) => {
      let studentReceived = false;
      let staffReceived = false;

      studentSocket.once('new-message', () => {
        studentReceived = true;
      });

      staffSocket.once('new-message', (message) => {
        if (message.isInternalNote) {
          staffReceived = true;
        }
      });

      setTimeout(() => resolve({ student: studentReceived, staff: staffReceived }), 3000);
    });

    // Staff creates an internal note
    await axios.post(
      `${BASE_URL}/tickets/${studentTicketId}/messages`,
      { body: 'Internal staff note', isInternalNote: true },
      { headers: { Cookie: staffCookie } }
    );

    const internalResult = await internalNoteTest;
    test('Internal note NOT sent to student', !internalResult.student);
    test('Internal note sent to staff only', internalResult.staff);

    // Test 8: Leave room
    console.log('');
    console.log('--- Room Management: Leave ---');

    await new Promise((resolve) => {
      studentSocket.once('left-ticket', (data) => {
        test('Student can leave ticket room', data.ticketId === studentTicketId);
        resolve();
      });

      studentSocket.emit('leave-ticket', studentTicketId);
    });

    // Cleanup
    studentSocket.disconnect();
    staffSocket.disconnect();

    console.log('');
    console.log('=========================================');
    console.log('Test Results');
    console.log('=========================================');
    console.log(`${COLORS.GREEN}Passed: ${passed}${COLORS.NC}`);
    console.log(`${COLORS.RED}Failed: ${failed}${COLORS.NC}`);
    console.log('');

    if (failed === 0) {
      console.log(`${COLORS.GREEN}All tests passed!${COLORS.NC}`);
      process.exit(0);
    } else {
      console.log(`${COLORS.RED}Some tests failed.${COLORS.NC}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`${COLORS.RED}Test error:${COLORS.NC}`, error.message);
    process.exit(1);
  }
}

main();
