#!/bin/bash

# Ticket Messages Routes Integration Tests
# Tests message creation and listing with proper RBAC and internal note filtering
#
# NOTE: MongoDB Collection Names (for manual verification)
# - Model: TicketMessage -> Collection: ticketmessages
# - Model: Ticket        -> Collection: tickets
# - Model: AuditLog      -> Collection: auditlogs
#
# To verify records after test:
#   docker exec westcliff-assistant-mongo-1 mongosh westcliff --quiet --eval "db.ticketmessages.find().pretty()"
#   docker exec westcliff-assistant-mongo-1 mongosh westcliff --quiet --eval "db.auditlogs.find({action:'MESSAGE_ADDED'}).pretty()"

BASE_URL="http://localhost:3001"
PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Ticket Messages Routes Tests"
echo "=========================================="
echo ""

# Test 1: Login as STUDENT 1
echo "Test 1: Login as STUDENT 1"
response=$(curl -s -w "\n%{http_code}" -c /tmp/student1-cookies.txt -X POST "$BASE_URL/auth/dev-login" \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@example.com","name":"Student One"}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN} PASS${NC}: Student 1 login successful"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED} FAIL${NC}: Student 1 login failed with code $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 2: Student 1 creates a ticket
echo "Test 2: Student 1 creates a ticket"
response=$(curl -s -w "\n%{http_code}" -b /tmp/student1-cookies.txt -X POST "$BASE_URL/tickets/intake/confirm" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Information Technology",
    "priority": "MEDIUM",
    "summary": "Need help with Canvas",
    "description": "I cannot upload my assignment to Canvas. Keep getting an error message."
  }')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "201" ]; then
  echo -e "${GREEN} PASS${NC}: Ticket created successfully"
  TICKET1_ID=$(echo "$body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "Ticket ID: $TICKET1_ID"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED} FAIL${NC}: Expected 201, got $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 3: Student 1 adds a message to their ticket
echo "Test 3: Student 1 adds message to own ticket (expect 201)"
if [ -n "$TICKET1_ID" ]; then
  response=$(curl -s -w "\n%{http_code}" -b /tmp/student1-cookies.txt -X POST "$BASE_URL/tickets/$TICKET1_ID/messages" \
    -H "Content-Type: application/json" \
    -d '{"body":"I am using Chrome browser. The error says upload failed."}')
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "201" ]; then
    echo -e "${GREEN} PASS${NC}: Message added successfully"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED} FAIL${NC}: Expected 201, got $http_code"
    echo "Response: $body"
    FAILED=$((FAILED + 1))
  fi
else
  echo -e "${YELLOW}⊘ SKIP${NC}: No ticket ID from previous test"
fi
echo ""

# Test 4: Student 1 tries to create internal note (should be silently ignored)
echo "Test 4: Student tries to create internal note (should be ignored)"
if [ -n "$TICKET1_ID" ]; then
  response=$(curl -s -w "\n%{http_code}" -b /tmp/student1-cookies.txt -X POST "$BASE_URL/tickets/$TICKET1_ID/messages" \
    -H "Content-Type: application/json" \
    -d '{"body":"This is my secret note","isInternalNote":true}')
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "201" ]; then
    # Check if isInternalNote is false in response
    is_internal=$(echo "$body" | grep -o '"isInternalNote":[^,}]*' | cut -d':' -f2)
    if [ "$is_internal" = "false" ]; then
      echo -e "${GREEN} PASS${NC}: Internal note flag correctly ignored for student"
      PASSED=$((PASSED + 1))
    else
      echo -e "${RED} FAIL${NC}: Expected isInternalNote to be false, got $is_internal"
      echo "Response: $body"
      FAILED=$((FAILED + 1))
    fi
  else
    echo -e "${RED} FAIL${NC}: Expected 201, got $http_code"
    echo "Response: $body"
    FAILED=$((FAILED + 1))
  fi
else
  echo -e "${YELLOW}⊘ SKIP${NC}: No ticket ID from previous test"
fi
echo ""

# Test 5: Student 1 lists messages on their ticket
echo "Test 5: Student 1 lists messages (expect 200)"
if [ -n "$TICKET1_ID" ]; then
  response=$(curl -s -w "\n%{http_code}" -b /tmp/student1-cookies.txt -X GET "$BASE_URL/tickets/$TICKET1_ID/messages")
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "200" ]; then
    echo -e "${GREEN} PASS${NC}: Messages fetched successfully"
    # Should have 3 messages: initial description + 2 we added
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

# Test 6: Login as STUDENT 2
echo "Test 6: Login as STUDENT 2"
response=$(curl -s -w "\n%{http_code}" -c /tmp/student2-cookies.txt -X POST "$BASE_URL/auth/dev-login" \
  -H "Content-Type: application/json" \
  -d '{"email":"student2@example.com","name":"Student Two"}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN} PASS${NC}: Student 2 login successful"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED} FAIL${NC}: Student 2 login failed with code $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 7: Student 2 tries to message Student 1's ticket (expect 403)
echo "Test 7: Student 2 tries to message other's ticket (expect 403)"
if [ -n "$TICKET1_ID" ]; then
  response=$(curl -s -w "\n%{http_code}" -b /tmp/student2-cookies.txt -X POST "$BASE_URL/tickets/$TICKET1_ID/messages" \
    -H "Content-Type: application/json" \
    -d '{"body":"I should not be able to send this"}')
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "403" ]; then
    echo -e "${GREEN} PASS${NC}: Student correctly denied from messaging other's ticket"
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

# Test 8: Student 2 tries to view Student 1's messages (expect 404)
echo "Test 8: Student 2 tries to view other's messages (expect 404)"
if [ -n "$TICKET1_ID" ]; then
  response=$(curl -s -w "\n%{http_code}" -b /tmp/student2-cookies.txt -X GET "$BASE_URL/tickets/$TICKET1_ID/messages")
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "404" ]; then
    echo -e "${GREEN} PASS${NC}: Student correctly denied from viewing other's messages"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED} FAIL${NC}: Expected 404, got $http_code"
    echo "Response: $body"
    FAILED=$((FAILED + 1))
  fi
else
  echo -e "${YELLOW}⊘ SKIP${NC}: No ticket ID from previous test"
fi
echo ""

# Test 9: Login as STAFF
echo "Test 9: Login as STAFF"
response=$(curl -s -w "\n%{http_code}" -c /tmp/staff-cookies.txt -X POST "$BASE_URL/auth/dev-login" \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@westcliff.edu","name":"Staff Member"}')
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

# Test 10: Staff adds regular message to student's ticket
echo "Test 10: Staff adds regular message (expect 201)"
if [ -n "$TICKET1_ID" ]; then
  response=$(curl -s -w "\n%{http_code}" -b /tmp/staff-cookies.txt -X POST "$BASE_URL/tickets/$TICKET1_ID/messages" \
    -H "Content-Type: application/json" \
    -d '{"body":"Thank you for reporting this. I will investigate the Canvas issue."}')
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "201" ]; then
    echo -e "${GREEN} PASS${NC}: Staff message added successfully"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED} FAIL${NC}: Expected 201, got $http_code"
    echo "Response: $body"
    FAILED=$((FAILED + 1))
  fi
else
  echo -e "${YELLOW}⊘ SKIP${NC}: No ticket ID from previous test"
fi
echo ""

# Test 11: Staff adds internal note
echo "Test 11: Staff adds internal note (expect 201)"
if [ -n "$TICKET1_ID" ]; then
  response=$(curl -s -w "\n%{http_code}" -b /tmp/staff-cookies.txt -X POST "$BASE_URL/tickets/$TICKET1_ID/messages" \
    -H "Content-Type: application/json" \
    -d '{"body":"Internal: This might be related to the recent Canvas update. Check with IT team.","isInternalNote":true}')
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "201" ]; then
    is_internal=$(echo "$body" | grep -o '"isInternalNote":[^,}]*' | cut -d':' -f2)
    if [ "$is_internal" = "true" ]; then
      echo -e "${GREEN} PASS${NC}: Internal note created successfully"
      PASSED=$((PASSED + 1))
    else
      echo -e "${RED} FAIL${NC}: Expected isInternalNote to be true, got $is_internal"
      echo "Response: $body"
      FAILED=$((FAILED + 1))
    fi
  else
    echo -e "${RED} FAIL${NC}: Expected 201, got $http_code"
    echo "Response: $body"
    FAILED=$((FAILED + 1))
  fi
else
  echo -e "${YELLOW}⊘ SKIP${NC}: No ticket ID from previous test"
fi
echo ""

# Test 12: Staff lists all messages (should see internal note)
echo "Test 12: Staff lists all messages including internal (expect 200)"
if [ -n "$TICKET1_ID" ]; then
  response=$(curl -s -w "\n%{http_code}" -b /tmp/staff-cookies.txt -X GET "$BASE_URL/tickets/$TICKET1_ID/messages")
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "200" ]; then
    echo -e "${GREEN} PASS${NC}: Staff can view all messages"
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

# Test 13: Student 1 lists messages (should NOT see internal note)
echo "Test 13: Student lists messages, should not see internal note"
if [ -n "$TICKET1_ID" ]; then
  response=$(curl -s -w "\n%{http_code}" -b /tmp/student1-cookies.txt -X GET "$BASE_URL/tickets/$TICKET1_ID/messages")
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "200" ]; then
    # Check if internal note text is NOT in the response
    if echo "$body" | grep -q "Internal: This might be related"; then
      echo -e "${RED} FAIL${NC}: Student can see internal note (should not)"
      echo "Response: $body"
      FAILED=$((FAILED + 1))
    else
      echo -e "${GREEN} PASS${NC}: Internal note correctly hidden from student"
      PASSED=$((PASSED + 1))
    fi
  else
    echo -e "${RED} FAIL${NC}: Expected 200, got $http_code"
    echo "Response: $body"
    FAILED=$((FAILED + 1))
  fi
else
  echo -e "${YELLOW}⊘ SKIP${NC}: No ticket ID from previous test"
fi
echo ""

# Test 14: Try to get messages for non-existent ticket
echo "Test 14: Try to get messages for non-existent ticket (expect 404)"
response=$(curl -s -w "\n%{http_code}" -b /tmp/staff-cookies.txt -X GET "$BASE_URL/tickets/000000000000000000000000/messages")
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

# Test 15: Try to post message with empty body (expect 400)
echo "Test 15: Try to post message with empty body (expect 400)"
if [ -n "$TICKET1_ID" ]; then
  response=$(curl -s -w "\n%{http_code}" -b /tmp/staff-cookies.txt -X POST "$BASE_URL/tickets/$TICKET1_ID/messages" \
    -H "Content-Type: application/json" \
    -d '{"body":""}')
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "400" ]; then
    echo -e "${GREEN} PASS${NC}: Empty message body rejected"
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
rm -f /tmp/student1-cookies.txt /tmp/student2-cookies.txt /tmp/staff-cookies.txt

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
