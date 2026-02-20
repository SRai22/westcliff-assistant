#!/bin/bash

# BE-05: RBAC Middleware Integration Tests
# Tests requireAuth and requireStaff middleware

BASE_URL="http://localhost:3001"
PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "BE-05: RBAC Middleware Tests"
echo "=========================================="
echo ""

# Test 1: Unauthenticated request to requireAuth route
echo "Test 1: Unauthenticated request to /api/test-auth (expect 401)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/test-auth")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "401" ]; then
  echo -e "${GREEN} PASS${NC}: Got 401 for unauthenticated request"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗ FAIL${NC}: Expected 401, got $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 2: Unauthenticated request to requireStaff route
echo "Test 2: Unauthenticated request to /api/test-staff (expect 401)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/test-staff")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "401" ]; then
  echo -e "${GREEN} PASS${NC}: Got 401 for unauthenticated request"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗ FAIL${NC}: Expected 401, got $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 3: Login as STUDENT
echo "Test 3: Login as STUDENT"
response=$(curl -s -w "\n%{http_code}" -c /tmp/student-cookies.txt -X POST "$BASE_URL/auth/dev-login" \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","name":"Test Student"}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN} PASS${NC}: Student login successful"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗ FAIL${NC}: Student login failed with code $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 4: STUDENT request to requireAuth route (expect 200)
echo "Test 4: STUDENT request to /api/test-auth (expect 200)"
response=$(curl -s -w "\n%{http_code}" -b /tmp/student-cookies.txt -X GET "$BASE_URL/api/test-auth")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN} PASS${NC}: Student can access requireAuth route"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗ FAIL${NC}: Expected 200, got $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 5: STUDENT request to requireStaff route (expect 403)
echo "Test 5: STUDENT request to /api/test-staff (expect 403)"
response=$(curl -s -w "\n%{http_code}" -b /tmp/student-cookies.txt -X GET "$BASE_URL/api/test-staff")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "403" ]; then
  echo -e "${GREEN} PASS${NC}: Student correctly denied access to staff route"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗ FAIL${NC}: Expected 403, got $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 6: Login as STAFF
echo "Test 6: Login as STAFF"
response=$(curl -s -w "\n%{http_code}" -c /tmp/staff-cookies.txt -X POST "$BASE_URL/auth/dev-login" \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@westcliff.edu","name":"Test Staff"}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN} PASS${NC}: Staff login successful"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗ FAIL${NC}: Staff login failed with code $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 7: STAFF request to requireAuth route (expect 200)
echo "Test 7: STAFF request to /api/test-auth (expect 200)"
response=$(curl -s -w "\n%{http_code}" -b /tmp/staff-cookies.txt -X GET "$BASE_URL/api/test-auth")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN} PASS${NC}: Staff can access requireAuth route"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗ FAIL${NC}: Expected 200, got $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 8: STAFF request to requireStaff route (expect 200)
echo "Test 8: STAFF request to /api/test-staff (expect 200)"
response=$(curl -s -w "\n%{http_code}" -b /tmp/staff-cookies.txt -X GET "$BASE_URL/api/test-staff")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN} PASS${NC}: Staff can access requireStaff route"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗ FAIL${NC}: Expected 200, got $http_code"
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
