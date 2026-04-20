# Backend Test Commands

## Quick Reference

### Run All Tests (Recommended)
```bash
npm test
```
**Runs:** All 88 integration tests across 8 test suites  
**Time:** ~60-90 seconds

---

## Individual Test Suites

### Authentication
```bash
npm run test:auth
```
**Tests:** 9 | **Topics:** User creation, session management, role assignment, logout

### RBAC (Role-Based Access Control)
```bash
npm run test:rbac
```
**Tests:** 8 | **Topics:** Authentication checks, student/staff permissions, 401/403 responses

### Ticket CRUD
```bash
npm run test:tickets
```
**Tests:** 12 | **Topics:** Create, list, retrieve tickets, role-based filtering, validation

### Ticket Status
```bash
npm run test:status
```
**Tests:** 10 | **Topics:** Status updates, history tracking, audit logs, staff-only access

### Ticket Messages
```bash
npm run test:messages
```
**Tests:** 15 | **Topics:** Message creation, internal notes, role filtering, real-time broadcast

### Articles (Knowledge Base)
```bash
npm run test:articles
```
**Tests:** 12 | **Topics:** Article listing, filtering, search, view tracking, seeding

### AI Proxy
```bash
npm run test:ai
```
**Tests:** 12 | **Topics:** Intake flow, categorization, staff assist, stub responses

### WebSocket (Socket.io)
```bash
npm run test:socket
```
**Tests:** 10 | **Topics:** Real-time connections, room management, message broadcast, auth

---

## Prerequisites

Before running tests, ensure services are running:

```bash
docker compose up -d backend mongo
```

To stop services after testing:

```bash
docker compose down
```

---

## CI/CD Usage

For continuous integration pipelines:

```bash
#!/bin/bash
# Start services
docker compose up -d backend mongo

# Wait for services to be ready
sleep 5

# Run all tests
npm test

# Capture exit code
EXIT_CODE=$?

# Cleanup
docker compose down

# Exit with test result
exit $EXIT_CODE
```

---

## Test Output

### Success
```
✓ Passed: 88
All tests passed! 🎉
```

### Failure
```
✗ Passed: 85, Failed: 3
Failed Test Suites:
  - Ticket Messages
Some tests failed.
```

---

## Troubleshooting

### Tests Failing
1. Ensure Docker services are running: `docker ps`
2. Check backend logs: `docker logs westcliff-assistant-backend-1`
3. Verify MongoDB is healthy: `docker logs westcliff-assistant-mongo-1`
4. Check no port conflicts (3001, 27017)

### Connection Errors
- Wait a few seconds after starting services before running tests
- Backend needs time to connect to MongoDB

### Cookie/Session Issues
- Tests create fresh users for each run
- Old cookies are cleaned up automatically

---

## Test File Locations

All test files are in `src/test/`:

```
src/test/
├── run-all-tests.sh         # Master test runner
├── auth-endpoints.test.sh   # Auth tests
├── rbac-middleware.test.sh  # RBAC tests
├── ticket-routes.test.sh    # Ticket CRUD tests
├── ticket-status-update.test.sh
├── ticket-messages.test.sh
├── articles.test.sh
├── ai-proxy.test.sh
└── socket.test.{sh,mjs}     # WebSocket tests
```

---

## Coverage Summary

| Suite | Tests | Coverage |
|-------|-------|----------|
| Auth | 9 | User lifecycle, sessions |
| RBAC | 8 | Access control, permissions |
| Tickets | 12 | CRUD, filtering, validation |
| Status | 10 | Updates, history, audit |
| Messages | 15 | Messaging, internal notes |
| Articles | 12 | KB search, seeding |
| AI Proxy | 12 | Intake, assist, stubs |
| WebSocket | 10 | Real-time, rooms, broadcast |
| **Total** | **88** | **Full backend API** |
