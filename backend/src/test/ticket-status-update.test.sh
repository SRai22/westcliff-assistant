#!/bin/bash

# Ticket Status Update Integration Tests
# Tests status update endpoint with proper RBAC, history tracking, and audit logging
#
# NOTE: MongoDB Collection Names (for manual verification)
# - Model: TicketStatusHistory -> Collection: ticketstatushistories
# - Model: AuditLog            -> Collection: auditlogs
# - Model: Ticket              -> Collection: tickets
#
# To verify records after test:
#   docker exec westcliff-assistant-mongo-1 mongosh westcliff --quiet --eval "db.ticketstatushistories.find().pretty()"
#   docker exec westcliff-assistant-mongo-1 mongosh westcliff --quiet --eval "db.auditlogs.find({action:'TICKET_STATUS_CHANGED'}).pretty()"

BASE_URL="http://localhost:3001"
PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Ticket Status Update Tests"
echo "=========================================="
echo ""

# Test 1: Login as STUDENT
echo "Test 1: Login as STUDENT"
response=$(curl -s -w "\n%{http_code}" -c /tmp/student-cookies.txt -X POST "$BASE_URL/auth/dev-login" \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","name":"Test Student"}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN} PASS${NC}: Student login successful"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED} FAIL${NC}: Student login failed with code $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 2: Student creates a ticket
echo "Test 2: Student creates a ticket"
response=$(curl -s -w "\n%{http_code}" -b /tmp/student-cookies.txt -X POST "$BASE_URL/tickets/intake/confirm" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Information Technology",
    "priority": "HIGH",
    "summary": "Laptop not connecting to WiFi",
    "description": "My laptop cannot connect to the campus WiFi network. I have tried restarting but it still does not work."
  }')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "201" ]; then
  echo -e "${GREEN} PASS${NC}: Ticket created successfully"
  TICKET_ID=$(echo "$body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "Ticket ID: $TICKET_ID"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED} FAIL${NC}: Expected 201, got $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 3: Student tries to update ticket status (expect 403)
echo "Test 3: Student tries to update status (expect 403)"
if [ -n "$TICKET_ID" ]; then
  response=$(curl -s -w "\n%{http_code}" -b /tmp/student-cookies.txt -X PATCH "$BASE_URL/tickets/$TICKET_ID/status" \
    -H "Content-Type: application/json" \
    -d '{"status":"IN_PROGRESS"}')
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "403" ]; then
    echo -e "${GREEN} PASS${NC}: Student correctly denied from updating status"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED} FAIL${NC}: Expected 403, got $http_code"
    echo "Response: $body"
    FAILED=$((FAILED + 1))
  fi
else
  echo -e "${YELLOW}⊘ SKIP${NC}: No ticket ID from previous test"
fi
echo ""

# Test 4: Login as STAFF
echo "Test 4: Login as STAFF"
response=$(curl -s -w "\n%{http_code}" -c /tmp/staff-cookies.txt -X POST "$BASE_URL/auth/dev-login" \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@westcliff.edu","name":"Test Staff"}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN} PASS${NC}: Staff login successful"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED} FAIL${NC}: Staff login failed with code $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 5: Staff updates ticket status to IN_PROGRESS
echo "Test 5: Staff updates status to IN_PROGRESS (expect 200)"
if [ -n "$TICKET_ID" ]; then
  response=$(curl -s -w "\n%{http_code}" -b /tmp/staff-cookies.txt -X PATCH "$BASE_URL/tickets/$TICKET_ID/status" \
    -H "Content-Type: application/json" \
    -d '{"status":"IN_PROGRESS","reason":"Investigating the WiFi connectivity issue"}')
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "200" ]; then
    echo -e "${GREEN} PASS${NC}: Status updated successfully"
    echo "Response: $body"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED} FAIL${NC}: Expected 200, got $http_code"
    echo "Response: $body"
    FAILED=$((FAILED + 1))
  fi
else
  echo -e "${YELLOW}⊘ SKIP${NC}: No ticket ID from previous test"
fi
echo ""

# Test 6: Verify ticket status was updated
echo "Test 6: Verify ticket status is IN_PROGRESS"
if [ -n "$TICKET_ID" ]; then
  response=$(curl -s -w "\n%{http_code}" -b /tmp/staff-cookies.txt -X GET "$BASE_URL/tickets/$TICKET_ID")
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "200" ]; then
    status=$(echo "$body" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ "$status" = "IN_PROGRESS" ]; then
      echo -e "${GREEN} PASS${NC}: Ticket status is IN_PROGRESS"
      PASSED=$((PASSED + 1))
    else
      echo -e "${RED} FAIL${NC}: Expected status IN_PROGRESS, got $status"
      FAILED=$((FAILED + 1))
    fi
  else
    echo -e "${RED} FAIL${NC}: Could not fetch ticket, got $http_code"
    FAILED=$((FAILED + 1))
  fi
else
  echo -e "${YELLOW}⊘ SKIP${NC}: No ticket ID from previous test"
fi
echo ""

# Test 7: Staff updates status again to WAITING
echo "Test 7: Staff updates status to WAITING (expect 200)"
if [ -n "$TICKET_ID" ]; then
  response=$(curl -s -w "\n%{http_code}" -b /tmp/staff-cookies.txt -X PATCH "$BASE_URL/tickets/$TICKET_ID/status" \
    -H "Content-Type: application/json" \
    -d '{"status":"WAITING","reason":"Waiting for student to provide more details"}')
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "200" ]; then
    echo -e "${GREEN} PASS${NC}: Status updated to WAITING"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED} FAIL${NC}: Expected 200, got $http_code"
    echo "Response: $body"
    FAILED=$((FAILED + 1))
  fi
else
  echo -e "${YELLOW}⊘ SKIP${NC}: No ticket ID from previous test"
fi
echo ""

# Test 8: Staff updates status to RESOLVED
echo "Test 8: Staff updates status to RESOLVED (expect 200)"
if [ -n "$TICKET_ID" ]; then
  response=$(curl -s -w "\n%{http_code}" -b /tmp/staff-cookies.txt -X PATCH "$BASE_URL/tickets/$TICKET_ID/status" \
    -H "Content-Type: application/json" \
    -d '{"status":"RESOLVED","reason":"WiFi credentials updated successfully"}')
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "200" ]; then
    echo -e "${GREEN} PASS${NC}: Status updated to RESOLVED"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED} FAIL${NC}: Expected 200, got $http_code"
    echo "Response: $body"
    FAILED=$((FAILED + 1))
  fi
else
  echo -e "${YELLOW}⊘ SKIP${NC}: No ticket ID from previous test"
fi
echo ""

# Test 9: Try to update non-existent ticket
echo "Test 9: Try to update non-existent ticket (expect 404)"
response=$(curl -s -w "\n%{http_code}" -b /tmp/staff-cookies.txt -X PATCH "$BASE_URL/tickets/000000000000000000000000/status" \
  -H "Content-Type: application/json" \
  -d '{"status":"IN_PROGRESS"}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "404" ]; then
  echo -e "${GREEN} PASS${NC}: Non-existent ticket returns 404"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED} FAIL${NC}: Expected 404, got $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 10: Try invalid status value (expect 400)
echo "Test 10: Try invalid status value (expect 400)"
if [ -n "$TICKET_ID" ]; then
  response=$(curl -s -w "\n%{http_code}" -b /tmp/staff-cookies.txt -X PATCH "$BASE_URL/tickets/$TICKET_ID/status" \
    -H "Content-Type: application/json" \
    -d '{"status":"INVALID_STATUS"}')
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "400" ]; then
    echo -e "${GREEN} PASS${NC}: Invalid status rejected with 400"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED} FAIL${NC}: Expected 400, got $http_code"
    echo "Response: $body"
    FAILED=$((FAILED + 1))
  fi
else
  echo -e "${YELLOW}⊘ SKIP${NC}: No ticket ID from previous test"
fi
echo ""

# Cleanup
rm -f /tmp/student-cookies.txt /tmp/staff-cookies.txt

# Summary
echo "=========================================="
echo "Test Results:"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "=========================================="

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed.${NC}"
  exit 1
fi
