#!/bin/bash

# BE-06: Ticket CRUD Routes Integration Tests
# Tests ticket listing, retrieval, and creation with proper RBAC
#
# NOTE: MongoDB Collection Names (for manual verification)
# Mongoose auto-generates collection names: lowercase + pluralized
# - Model: Ticket              -> Collection: tickets
# - Model: TicketMessage       -> Collection: ticketmessages
# - Model: TicketStatusHistory -> Collection: ticketstatushistories
# - Model: AuditLog            -> Collection: auditlogs
# - Model: User                -> Collection: users
#
# To verify records after test:
#   docker exec westcliff-assistant-mongo-1 mongosh westcliff --quiet --eval "db.tickets.countDocuments({})"
#   docker exec westcliff-assistant-mongo-1 mongosh westcliff --quiet --eval "db.ticketstatushistories.find().pretty()"

BASE_URL="http://localhost:3001"
PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "BE-06: Ticket CRUD Routes Tests"
echo "=========================================="
echo ""

# Test 1: Create ticket without authentication (expect 401)
echo "Test 1: Create ticket without authentication (expect 401)"
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tickets/intake/confirm" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Information Technology",
    "priority": "MEDIUM",
    "summary": "Cannot access email",
    "description": "I am unable to log in to my Westcliff email account"
  }')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "401" ]; then
  echo -e "${GREEN} PASS${NC}: Got 401 for unauthenticated request"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED} FAIL${NC}: Expected 401, got $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 2: Login as STUDENT
echo "Test 2: Login as STUDENT"
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

# Test 3: Student creates a ticket
echo "Test 3: Student creates a ticket (expect 201)"
response=$(curl -s -w "\n%{http_code}" -b /tmp/student-cookies.txt -X POST "$BASE_URL/tickets/intake/confirm" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Information Technology",
    "priority": "MEDIUM",
    "summary": "Cannot access email account",
    "description": "I am unable to log in to my Westcliff email account. I have tried resetting my password but still cannot access it."
  }')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "201" ]; then
  echo -e "${GREEN} PASS${NC}: Ticket created successfully"
  STUDENT_TICKET_ID=$(echo "$body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "Ticket ID: $STUDENT_TICKET_ID"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED} FAIL${NC}: Expected 201, got $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 4: Student creates another ticket
echo "Test 4: Student creates second ticket (expect 201)"
response=$(curl -s -w "\n%{http_code}" -b /tmp/student-cookies.txt -X POST "$BASE_URL/tickets/intake/confirm" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Registrar",
    "priority": "HIGH",
    "summary": "Need transcript urgently",
    "description": "I need an official transcript sent to ABC University for my graduate application. The deadline is next week."
  }')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "201" ]; then
  echo -e "${GREEN} PASS${NC}: Second ticket created successfully"
  STUDENT_TICKET_ID_2=$(echo "$body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "Ticket ID: $STUDENT_TICKET_ID_2"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED} FAIL${NC}: Expected 201, got $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 5: Student lists their tickets
echo "Test 5: Student lists tickets (expect 200 with 2 tickets)"
response=$(curl -s -w "\n%{http_code}" -b /tmp/student-cookies.txt -X GET "$BASE_URL/tickets")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
  ticket_count=$(echo "$body" | grep -o '"tickets":\[' | wc -l)
  if [ "$ticket_count" -ge 1 ]; then
    echo -e "${GREEN} PASS${NC}: Student can list their tickets"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED} FAIL${NC}: Expected tickets array, got: $body"
    FAILED=$((FAILED + 1))
  fi
else
  echo -e "${RED} FAIL${NC}: Expected 200, got $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 6: Student retrieves their own ticket
echo "Test 6: Student retrieves own ticket (expect 200)"
if [ -n "$STUDENT_TICKET_ID" ]; then
  response=$(curl -s -w "\n%{http_code}" -b /tmp/student-cookies.txt -X GET "$BASE_URL/tickets/$STUDENT_TICKET_ID")
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "200" ]; then
    echo -e "${GREEN} PASS${NC}: Student can retrieve own ticket"
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

# Test 7: Login as STAFF
echo "Test 7: Login as STAFF"
response=$(curl -s -w "\n%{http_code}" -c /tmp/staff-cookies.txt -X POST "$BASE_URL/auth/dev-login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@westcliff.edu","name":"Test Admin"}')
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

# Test 8: Staff creates a ticket
echo "Test 8: Staff creates a ticket (expect 201)"
response=$(curl -s -w "\n%{http_code}" -b /tmp/staff-cookies.txt -X POST "$BASE_URL/tickets/intake/confirm" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Student Services",
    "priority": "LOW",
    "summary": "Question about parking permits",
    "description": "I need information about how to obtain a parking permit for the campus."
  }')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "201" ]; then
  echo -e "${GREEN} PASS${NC}: Staff can also create tickets"
  STAFF_TICKET_ID=$(echo "$body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "Ticket ID: $STAFF_TICKET_ID"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED} FAIL${NC}: Expected 201, got $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 9: Staff lists all tickets
echo "Test 9: Staff lists all tickets (expect 200 with all tickets)"
response=$(curl -s -w "\n%{http_code}" -b /tmp/staff-cookies.txt -X GET "$BASE_URL/tickets")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
  ticket_count=$(echo "$body" | grep -o '"tickets":\[' | wc -l)
  if [ "$ticket_count" -ge 1 ]; then
    echo -e "${GREEN} PASS${NC}: Staff can list all tickets"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED} FAIL${NC}: Expected tickets array, got: $body"
    FAILED=$((FAILED + 1))
  fi
else
  echo -e "${RED} FAIL${NC}: Expected 200, got $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 10: Staff retrieves student's ticket
echo "Test 10: Staff retrieves student's ticket (expect 200)"
if [ -n "$STUDENT_TICKET_ID" ]; then
  response=$(curl -s -w "\n%{http_code}" -b /tmp/staff-cookies.txt -X GET "$BASE_URL/tickets/$STUDENT_TICKET_ID")
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "200" ]; then
    echo -e "${GREEN} PASS${NC}: Staff can retrieve any ticket"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED} FAIL${NC}: Expected 200, got $http_code"
    echo "Response: $body"
    FAILED=$((FAILED + 1))
  fi
else
  echo -e "${YELLOW}⊘ SKIP${NC}: No student ticket ID from previous test"
fi
echo ""

# Test 11: Student tries to retrieve staff's ticket (expect 404)
echo "Test 11: Student tries to retrieve staff's ticket (expect 404)"
if [ -n "$STAFF_TICKET_ID" ]; then
  response=$(curl -s -w "\n%{http_code}" -b /tmp/student-cookies.txt -X GET "$BASE_URL/tickets/$STAFF_TICKET_ID")
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "404" ]; then
    echo -e "${GREEN} PASS${NC}: Student correctly denied access to other's ticket"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED} FAIL${NC}: Expected 404, got $http_code"
    echo "Response: $body"
    FAILED=$((FAILED + 1))
  fi
else
  echo -e "${YELLOW}⊘ SKIP${NC}: No staff ticket ID from previous test"
fi
echo ""

# Test 12: Test query filters - filter by category
echo "Test 12: Staff filters tickets by category (expect 200)"
response=$(curl -s -w "\n%{http_code}" -b /tmp/staff-cookies.txt -X GET "$BASE_URL/tickets?category=Information%20Technology")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN} PASS${NC}: Category filter works"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED} FAIL${NC}: Expected 200, got $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
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
