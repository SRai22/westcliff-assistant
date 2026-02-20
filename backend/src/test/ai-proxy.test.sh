#!/bin/bash

# AI Proxy Routes Integration Tests
# Tests the AI service proxy endpoints with stub responses

BASE_URL="http://localhost:3001"
PASSED=0
FAILED=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test helper function
test_endpoint() {
  local test_name="$1"
  local expected_status="$2"
  local response="$3"
  local actual_status=$(echo "$response" | head -n 1)
  
  if [ "$actual_status" = "$expected_status" ]; then
    echo -e "${GREEN}${NC} $test_name"
    ((PASSED++))
    return 0
  else
    echo -e "${RED}${NC} $test_name (expected $expected_status, got $actual_status)"
    echo "Response: $response"
    ((FAILED++))
    return 1
  fi
}

echo "========================================="
echo "AI Proxy Routes Integration Tests"
echo "========================================="
echo ""

# Clean up any existing sessions
rm -f connect.sid 2>/dev/null

echo "--- Setup: Creating test users ---"

# Create student user
STUDENT_RESPONSE=$(curl -s -i -X POST "$BASE_URL/auth/dev-login" \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com"}' \
  -c student_cookies.txt)

STUDENT_STATUS=$(echo "$STUDENT_RESPONSE" | head -n 1 | grep -o '[0-9]\{3\}')
if [ "$STUDENT_STATUS" = "200" ]; then
  echo -e "${GREEN}${NC} Student user created"
else
  echo -e "${RED}${NC} Failed to create student user"
  exit 1
fi

# Create staff user
STAFF_RESPONSE=$(curl -s -i -X POST "$BASE_URL/auth/dev-login" \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@westcliff.edu"}' \
  -c staff_cookies.txt)

STAFF_STATUS=$(echo "$STAFF_RESPONSE" | head -n 1 | grep -o '[0-9]\{3\}')
if [ "$STAFF_STATUS" = "200" ]; then
  echo -e "${GREEN}${NC} Staff user created"
else
  echo -e "${RED}${NC} Failed to create staff user"
  exit 1
fi

echo ""
echo "--- AI Intake Endpoints ---"

# Test 1: POST /tickets/intake/start - unauthenticated (should fail)
echo "Test 1: Intake start without authentication"
RESPONSE=$(curl -s -i -X POST "$BASE_URL/tickets/intake/start" \
  -H "Content-Type: application/json" \
  -d '{"text":"I need help with my password"}')
STATUS=$(echo "$RESPONSE" | head -n 1 | grep -o '[0-9]\{3\}')
test_endpoint "Unauthenticated intake start blocked" "401" "$STATUS"

# Test 2: POST /tickets/intake/start - authenticated student
echo "Test 2: Intake start with student authentication"
RESPONSE=$(curl -s -i -X POST "$BASE_URL/tickets/intake/start" \
  -H "Content-Type: application/json" \
  -b student_cookies.txt \
  -d '{"text":"I need help with my I-20 visa document"}')
STATUS=$(echo "$RESPONSE" | head -n 1 | grep -o '[0-9]\{3\}')
BODY=$(echo "$RESPONSE" | tail -n 1)
if test_endpoint "Student can start intake" "200" "$STATUS"; then
  # Verify response structure
  if echo "$BODY" | jq -e '.category' > /dev/null 2>&1 && \
     echo "$BODY" | jq -e '.clarifyingQuestions' > /dev/null 2>&1 && \
     echo "$BODY" | jq -e '.ticketDraft' > /dev/null 2>&1 && \
     echo "$BODY" | jq -e '.confidence' > /dev/null 2>&1; then
    echo -e "  ${GREEN}${NC} Response has correct structure"
    # Check if it correctly categorized as International Affairs
    CATEGORY=$(echo "$BODY" | jq -r '.category')
    if [ "$CATEGORY" = "International Affairs" ]; then
      echo -e "  ${GREEN}${NC} Correctly categorized as International Affairs"
    fi
  else
    echo -e "  ${YELLOW}⚠${NC} Response structure incomplete"
  fi
fi

# Test 3: POST /tickets/intake/start - with invalid data
echo "Test 3: Intake start with invalid data (text too short)"
RESPONSE=$(curl -s -i -X POST "$BASE_URL/tickets/intake/start" \
  -H "Content-Type: application/json" \
  -b student_cookies.txt \
  -d '{"text":"Hi"}')
STATUS=$(echo "$RESPONSE" | head -n 1 | grep -o '[0-9]\{3\}')
test_endpoint "Short text rejected" "400" "$STATUS"

# Test 4: POST /tickets/intake/start - password issue categorization
echo "Test 4: Intake start with password issue"
RESPONSE=$(curl -s -i -X POST "$BASE_URL/tickets/intake/start" \
  -H "Content-Type: application/json" \
  -b student_cookies.txt \
  -d '{"text":"I forgot my password and cannot login to Canvas"}')
STATUS=$(echo "$RESPONSE" | head -n 1 | grep -o '[0-9]\{3\}')
BODY=$(echo "$RESPONSE" | tail -n 1)
if test_endpoint "Password issue triage successful" "200" "$STATUS"; then
  CATEGORY=$(echo "$BODY" | jq -r '.category')
  if [ "$CATEGORY" = "Information Technology" ]; then
    echo -e "  ${GREEN}${NC} Correctly categorized as Information Technology"
  fi
fi

# Test 5: POST /tickets/intake/answer - followup with answers
echo "Test 5: Intake answer with followup"
# First get a triage response
TRIAGE_BODY=$(curl -s -X POST "$BASE_URL/tickets/intake/start" \
  -H "Content-Type: application/json" \
  -b student_cookies.txt \
  -d '{"text":"I need help with tuition payment"}' | tail -n 1)

# Now send followup
RESPONSE=$(curl -s -i -X POST "$BASE_URL/tickets/intake/answer" \
  -H "Content-Type: application/json" \
  -b student_cookies.txt \
  -d "{\"triageResult\":$TRIAGE_BODY,\"answers\":{\"q1\":\"Today\",\"q2\":\"Yes, I tried checking my account\"}}")
STATUS=$(echo "$RESPONSE" | head -n 1 | grep -o '[0-9]\{3\}')
BODY=$(echo "$RESPONSE" | tail -n 1)
if test_endpoint "Intake followup successful" "200" "$STATUS"; then
  if echo "$BODY" | jq -e '.ticketDraft' > /dev/null 2>&1; then
    echo -e "  ${GREEN}${NC} Followup response has ticket draft"
    # Check if description was enhanced with answers
    DESCRIPTION=$(echo "$BODY" | jq -r '.ticketDraft.description')
    if echo "$DESCRIPTION" | grep -q "Additional Information"; then
      echo -e "  ${GREEN}${NC} Description enhanced with answers"
    fi
  fi
fi

echo ""
echo "--- AI Staff Assist Endpoints ---"

# First create a ticket for staff assist tests
echo "Creating test ticket for staff assist..."
TICKET_RESPONSE=$(curl -s -X POST "$BASE_URL/tickets/intake/confirm" \
  -H "Content-Type: application/json" \
  -b student_cookies.txt \
  -d '{
    "category": "Information Technology",
    "priority": "HIGH",
    "summary": "Cannot access my email account",
    "description": "I have been unable to log into my Westcliff email for the past 3 days",
    "service": "Email Access"
  }')
TICKET_ID=$(echo "$TICKET_RESPONSE" | jq -r '.ticket.id')
echo "Test ticket created: $TICKET_ID"

# Add some messages to the ticket
curl -s -X POST "$BASE_URL/tickets/$TICKET_ID/messages" \
  -H "Content-Type: application/json" \
  -b student_cookies.txt \
  -d '{"body":"I tried resetting my password but still cannot access"}' > /dev/null

# Test 6: POST /tickets/:id/ai/summarize - student (should fail)
echo "Test 6: Student cannot access AI summarize"
RESPONSE=$(curl -s -i -X POST "$BASE_URL/tickets/$TICKET_ID/ai/summarize" \
  -H "Content-Type: application/json" \
  -b student_cookies.txt \
  -d '{"ticketId":"'$TICKET_ID'","messages":[]}')
STATUS=$(echo "$RESPONSE" | head -n 1 | grep -o '[0-9]\{3\}')
test_endpoint "Student blocked from AI summarize" "403" "$STATUS"

# Test 7: POST /tickets/:id/ai/summarize - staff
echo "Test 7: Staff can access AI summarize"
RESPONSE=$(curl -s -i -X POST "$BASE_URL/tickets/$TICKET_ID/ai/summarize" \
  -H "Content-Type: application/json" \
  -b staff_cookies.txt \
  -d '{"ticketId":"'$TICKET_ID'","messages":[]}')
STATUS=$(echo "$RESPONSE" | head -n 1 | grep -o '[0-9]\{3\}')
BODY=$(echo "$RESPONSE" | tail -n 1)
if test_endpoint "Staff can get AI summary" "200" "$STATUS"; then
  if echo "$BODY" | jq -e '.summary' > /dev/null 2>&1; then
    echo -e "  ${GREEN}${NC} Response has summary field"
    SUMMARY=$(echo "$BODY" | jq -r '.summary')
    echo -e "  Summary: ${SUMMARY:0:80}..."
  fi
fi

# Test 8: POST /tickets/:id/ai/draft-reply - student (should fail)
echo "Test 8: Student cannot access AI draft reply"
RESPONSE=$(curl -s -i -X POST "$BASE_URL/tickets/$TICKET_ID/ai/draft-reply" \
  -H "Content-Type: application/json" \
  -b student_cookies.txt \
  -d '{"ticketId":"'$TICKET_ID'","messages":[],"tone":"professional"}')
STATUS=$(echo "$RESPONSE" | head -n 1 | grep -o '[0-9]\{3\}')
test_endpoint "Student blocked from AI draft reply" "403" "$STATUS"

# Test 9: POST /tickets/:id/ai/draft-reply - staff with default tone
echo "Test 9: Staff can get AI draft reply (default tone)"
RESPONSE=$(curl -s -i -X POST "$BASE_URL/tickets/$TICKET_ID/ai/draft-reply" \
  -H "Content-Type: application/json" \
  -b staff_cookies.txt \
  -d '{"ticketId":"'$TICKET_ID'","messages":[]}')
STATUS=$(echo "$RESPONSE" | head -n 1 | grep -o '[0-9]\{3\}')
BODY=$(echo "$RESPONSE" | tail -n 1)
if test_endpoint "Staff can get AI draft reply" "200" "$STATUS"; then
  if echo "$BODY" | jq -e '.draft' > /dev/null 2>&1 && \
     echo "$BODY" | jq -e '.suggestedNextSteps' > /dev/null 2>&1; then
    echo -e "  ${GREEN}${NC} Response has draft and suggestedNextSteps"
    DRAFT=$(echo "$BODY" | jq -r '.draft')
    echo -e "  Draft preview: ${DRAFT:0:80}..."
  fi
fi

# Test 10: POST /tickets/:id/ai/draft-reply - staff with friendly tone
echo "Test 10: Staff can get AI draft reply (friendly tone)"
RESPONSE=$(curl -s -i -X POST "$BASE_URL/tickets/$TICKET_ID/ai/draft-reply" \
  -H "Content-Type: application/json" \
  -b staff_cookies.txt \
  -d '{"ticketId":"'$TICKET_ID'","messages":[],"tone":"friendly"}')
STATUS=$(echo "$RESPONSE" | head -n 1 | grep -o '[0-9]\{3\}')
BODY=$(echo "$RESPONSE" | tail -n 1)
if test_endpoint "Staff can get friendly tone draft" "200" "$STATUS"; then
  DRAFT=$(echo "$BODY" | jq -r '.draft')
  if echo "$DRAFT" | grep -q "Hi there!"; then
    echo -e "  ${GREEN}${NC} Friendly tone detected"
  fi
fi

# Test 11: POST /tickets/:id/ai/summarize - non-existent ticket
echo "Test 11: AI summarize with non-existent ticket"
RESPONSE=$(curl -s -i -X POST "$BASE_URL/tickets/000000000000000000000000/ai/summarize" \
  -H "Content-Type: application/json" \
  -b staff_cookies.txt \
  -d '{"ticketId":"000000000000000000000000","messages":[]}')
STATUS=$(echo "$RESPONSE" | head -n 1 | grep -o '[0-9]\{3\}')
test_endpoint "Non-existent ticket returns 404" "404" "$STATUS"

# Test 12: POST /tickets/:id/ai/draft-reply - concise tone
echo "Test 12: Staff can get AI draft reply (concise tone)"
RESPONSE=$(curl -s -i -X POST "$BASE_URL/tickets/$TICKET_ID/ai/draft-reply" \
  -H "Content-Type: application/json" \
  -b staff_cookies.txt \
  -d '{"ticketId":"'$TICKET_ID'","messages":[],"tone":"concise"}')
STATUS=$(echo "$RESPONSE" | head -n 1 | grep -o '[0-9]\{3\}')
BODY=$(echo "$RESPONSE" | tail -n 1)
if test_endpoint "Staff can get concise tone draft" "200" "$STATUS"; then
  DRAFT=$(echo "$BODY" | jq -r '.draft')
  if echo "$DRAFT" | grep -q "Hello,"; then
    echo -e "  ${GREEN}${NC} Concise tone detected"
  fi
fi

echo ""
echo "--- Cleanup ---"
rm -f student_cookies.txt staff_cookies.txt

echo ""
echo "========================================="
echo "Test Results"
echo "========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed.${NC}"
  exit 1
fi
