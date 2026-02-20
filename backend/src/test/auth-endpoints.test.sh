#!/bin/bash

# Auth endpoints integration test script
# Run this after starting the backend service with: docker compose up backend mongo
# Usage: bash src/test/auth-endpoints.test.sh

set -e

BASE_URL="http://localhost:3001"
COOKIES_FILE="/tmp/westcliff-auth-test-cookies.txt"
FAILED=0
PASSED=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Testing Auth Endpoints..."
echo "=========================="
echo ""

# Clean up cookies from previous run
rm -f "$COOKIES_FILE"

# Test 1: POST /auth/dev-login with valid staff email
echo "Test 1: POST /auth/dev-login with staff email"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/dev-login" \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@westcliff.edu"}' \
  -c "$COOKIES_FILE")

if echo "$RESPONSE" | jq -e '.email == "alex@westcliff.edu" and .role == "STAFF"' > /dev/null; then
  echo -e "${GREEN}[PASS]${NC} Staff user created successfully"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}[FAIL]${NC} Staff user creation failed"
  echo "Response: $RESPONSE"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 2: GET /auth/me with session cookie
echo "Test 2: GET /auth/me with valid session"
RESPONSE=$(curl -s -X GET "$BASE_URL/auth/me" \
  -b "$COOKIES_FILE")

if echo "$RESPONSE" | jq -e '.email == "alex@westcliff.edu"' > /dev/null; then
  echo -e "${GREEN}[PASS]${NC} Session authentication works"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}[FAIL]${NC} Session authentication failed"
  echo "Response: $RESPONSE"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 3: POST /auth/logout
echo "Test 3: POST /auth/logout"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/logout" \
  -b "$COOKIES_FILE")

if echo "$RESPONSE" | jq -e '.message == "Logged out successfully"' > /dev/null; then
  echo -e "${GREEN}[PASS]${NC} Logout successful"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}[FAIL]${NC} Logout failed"
  echo "Response: $RESPONSE"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 4: GET /auth/me after logout (should return 401)
echo "Test 4: GET /auth/me after logout (should return 401)"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/auth/me" \
  -b "$COOKIES_FILE")

if [ "$HTTP_CODE" -eq 401 ]; then
  echo -e "${GREEN}[PASS]${NC} Correctly returns 401 after logout"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}[FAIL]${NC} Expected 401, got $HTTP_CODE"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 5: GET /auth/me without session (should return 401)
echo "Test 5: GET /auth/me without session (should return 401)"
rm -f "$COOKIES_FILE"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/auth/me")

if [ "$HTTP_CODE" -eq 401 ]; then
  echo -e "${GREEN}[PASS]${NC} Correctly returns 401 without session"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}[FAIL]${NC} Expected 401, got $HTTP_CODE"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 6: POST /auth/dev-login with student email
echo "Test 6: POST /auth/dev-login with student email"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/dev-login" \
  -H "Content-Type: application/json" \
  -d '{"email":"student.john@westcliff.edu"}')

if echo "$RESPONSE" | jq -e '.email == "student.john@westcliff.edu" and .role == "STUDENT"' > /dev/null; then
  echo -e "${GREEN}[PASS]${NC} Student role assigned correctly"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}[FAIL]${NC} Student role assignment failed"
  echo "Response: $RESPONSE"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 7: POST /auth/dev-login with invalid email format
echo "Test 7: POST /auth/dev-login with invalid email format"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/auth/dev-login" \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email"}')

if [ "$HTTP_CODE" -eq 400 ]; then
  echo -e "${GREEN}[PASS]${NC} Invalid email format rejected with 400"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}[FAIL]${NC} Expected 400, got $HTTP_CODE"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 8: POST /auth/dev-login with missing email
echo "Test 8: POST /auth/dev-login with missing email"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/auth/dev-login" \
  -H "Content-Type: application/json" \
  -d '{}')

if [ "$HTTP_CODE" -eq 400 ]; then
  echo -e "${GREEN}[PASS]${NC} Missing email rejected with 400"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}[FAIL]${NC} Expected 400, got $HTTP_CODE"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 9: POST /auth/dev-login with external email (non-westcliff)
echo "Test 9: POST /auth/dev-login with external email"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/dev-login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@gmail.com"}')

if echo "$RESPONSE" | jq -e '.email == "user@gmail.com" and .role == "STUDENT"' > /dev/null; then
  echo -e "${GREEN}[PASS]${NC} External email defaults to STUDENT role"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}[FAIL]${NC} External email role assignment failed"
  echo "Response: $RESPONSE"
  FAILED=$((FAILED + 1))
fi
echo ""

# Clean up
rm -f "$COOKIES_FILE"

# Summary
echo "=========================="
echo "Test Summary"
echo "=========================="
echo -e "${GREEN}Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}Failed: $FAILED${NC}"
  exit 1
else
  echo -e "${YELLOW}Failed: $FAILED${NC}"
  echo ""
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
fi
