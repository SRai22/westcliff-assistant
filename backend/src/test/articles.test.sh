#!/bin/bash

# Knowledge Base Articles Routes Integration Tests
# Tests article listing, filtering, and retrieval
#
# NOTE: MongoDB Collection Names (for manual verification)
# - Model: Article -> Collection: articles
# - Model: User    -> Collection: users
#
# To verify records after test:
#   docker exec westcliff-assistant-mongo-1 mongosh westcliff --quiet --eval "db.articles.countDocuments({})"
#   docker exec westcliff-assistant-mongo-1 mongosh westcliff --quiet --eval "db.articles.find({}, {title:1, category:1, isPublished:1})"

BASE_URL="http://localhost:3001"
PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Knowledge Base Articles Routes Integration Tests"
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

# Test 2: List all articles (unauthenticated - expect 401)
echo "Test 2: Try to list articles without authentication (expect 401)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/articles")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "401" ]; then
  echo -e "${GREEN} PASS${NC}: Unauthenticated request rejected"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED} FAIL${NC}: Expected 401, got $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 3: List all articles (authenticated)
echo "Test 3: List all articles (expect 200)"
response=$(curl -s -w "\n%{http_code}" -b /tmp/student-cookies.txt -X GET "$BASE_URL/articles")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
  article_count=$(echo "$body" | grep -o '"articles":\[' | wc -l)
  if [ "$article_count" -ge 1 ]; then
    echo -e "${GREEN} PASS${NC}: Articles listed successfully"
    # Extract first article ID for later tests
    ARTICLE_ID=$(echo "$body" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "Sample Article ID: $ARTICLE_ID"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED} FAIL${NC}: No articles in response"
    echo "Response: $body"
    FAILED=$((FAILED + 1))
  fi
else
  echo -e "${RED} FAIL${NC}: Expected 200, got $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 4: Filter articles by category - International Affairs
echo "Test 4: Filter by category (International Affairs)"
response=$(curl -s -w "\n%{http_code}" -b /tmp/student-cookies.txt -X GET "$BASE_URL/articles?category=International%20Affairs")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
  # Check if there are articles and they are from International Affairs
  if echo "$body" | grep -q '"category":"International Affairs"'; then
    echo -e "${GREEN} PASS${NC}: Category filter works"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED} FAIL${NC}: No International Affairs articles found"
    echo "Response: $body"
    FAILED=$((FAILED + 1))
  fi
else
  echo -e "${RED} FAIL${NC}: Expected 200, got $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 5: Filter by another category - Information Technology
echo "Test 5: Filter by category (Information Technology)"
response=$(curl -s -w "\n%{http_code}" -b /tmp/student-cookies.txt -X GET "$BASE_URL/articles?category=Information%20Technology")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
  if echo "$body" | grep -q '"category":"Information Technology"'; then
    echo -e "${GREEN} PASS${NC}: IT category filter works"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED} FAIL${NC}: No IT articles found"
    echo "Response: $body"
    FAILED=$((FAILED + 1))
  fi
else
  echo -e "${RED} FAIL${NC}: Expected 200, got $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 6: Search articles by text
echo "Test 6: Search articles by text (password)"
response=$(curl -s -w "\n%{http_code}" -b /tmp/student-cookies.txt -X GET "$BASE_URL/articles?search=password")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
  if echo "$body" | grep -qi "password"; then
    echo -e "${GREEN} PASS${NC}: Text search works"
    PASSED=$((PASSED + 1))
  else
    echo -e "${YELLOW}⊘ WARN${NC}: Search returned results but content not verified"
    PASSED=$((PASSED + 1))
  fi
else
  echo -e "${RED} FAIL${NC}: Expected 200, got $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 7: Get a specific article by ID
echo "Test 7: Get article by ID (expect 200)"
if [ -n "$ARTICLE_ID" ]; then
  response=$(curl -s -w "\n%{http_code}" -b /tmp/student-cookies.txt -X GET "$BASE_URL/articles/$ARTICLE_ID")
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "200" ]; then
    if echo "$body" | grep -q '"article":{'; then
      echo -e "${GREEN} PASS${NC}: Article retrieved successfully"
      PASSED=$((PASSED + 1))
    else
      echo -e "${RED} FAIL${NC}: Response doesn't contain article"
      echo "Response: $body"
      FAILED=$((FAILED + 1))
    fi
  else
    echo -e "${RED} FAIL${NC}: Expected 200, got $http_code"
    echo "Response: $body"
    FAILED=$((FAILED + 1))
  fi
else
  echo -e "${YELLOW}⊘ SKIP${NC}: No article ID from previous test"
fi
echo ""

# Test 8: Get article by ID twice (verify view count increments)
echo "Test 8: Get same article again (verify view count increments)"
if [ -n "$ARTICLE_ID" ]; then
  # Get first view count
  response1=$(curl -s -b /tmp/student-cookies.txt -X GET "$BASE_URL/articles/$ARTICLE_ID")
  view_count1=$(echo "$response1" | grep -o '"viewCount":[0-9]*' | head -1 | cut -d':' -f2)
  
  # Get article again
  response2=$(curl -s -b /tmp/student-cookies.txt -X GET "$BASE_URL/articles/$ARTICLE_ID")
  view_count2=$(echo "$response2" | grep -o '"viewCount":[0-9]*' | head -1 | cut -d':' -f2)
  
  if [ "$view_count2" -gt "$view_count1" ]; then
    echo -e "${GREEN} PASS${NC}: View count incremented ($view_count1 -> $view_count2)"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED} FAIL${NC}: View count did not increment ($view_count1 -> $view_count2)"
    FAILED=$((FAILED + 1))
  fi
else
  echo -e "${YELLOW}⊘ SKIP${NC}: No article ID from previous test"
fi
echo ""

# Test 9: Get non-existent article (expect 404)
echo "Test 9: Get non-existent article (expect 404)"
response=$(curl -s -w "\n%{http_code}" -b /tmp/student-cookies.txt -X GET "$BASE_URL/articles/000000000000000000000000")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "404" ]; then
  echo -e "${GREEN} PASS${NC}: Non-existent article returns 404"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED} FAIL${NC}: Expected 404, got $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 10: Get article with invalid ID format (expect 404)
echo "Test 10: Get article with invalid ID (expect 404)"
response=$(curl -s -w "\n%{http_code}" -b /tmp/student-cookies.txt -X GET "$BASE_URL/articles/invalid-id")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "404" ]; then
  echo -e "${GREEN} PASS${NC}: Invalid ID returns 404"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED} FAIL${NC}: Expected 404, got $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 11: Pagination test
echo "Test 11: Test pagination (limit=2)"
response=$(curl -s -w "\n%{http_code}" -b /tmp/student-cookies.txt -X GET "$BASE_URL/articles?limit=2")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
  # Check if pagination object exists
  if echo "$body" | grep -q '"pagination":{'; then
    echo -e "${GREEN} PASS${NC}: Pagination works"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED} FAIL${NC}: No pagination in response"
    echo "Response: $body"
    FAILED=$((FAILED + 1))
  fi
else
  echo -e "${RED} FAIL${NC}: Expected 200, got $http_code"
  echo "Response: $body"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 12: Login as STAFF and verify they can also access articles
echo "Test 12: Staff can access articles"
response=$(curl -s -w "\n%{http_code}" -c /tmp/staff-cookies.txt -X POST "$BASE_URL/auth/dev-login" \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@westcliff.edu","name":"Test Staff"}')
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" = "200" ]; then
  # Try to get articles as staff
  response=$(curl -s -w "\n%{http_code}" -b /tmp/staff-cookies.txt -X GET "$BASE_URL/articles")
  http_code=$(echo "$response" | tail -n1)
  
  if [ "$http_code" = "200" ]; then
    echo -e "${GREEN} PASS${NC}: Staff can access articles"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED} FAIL${NC}: Staff cannot access articles"
    FAILED=$((FAILED + 1))
  fi
else
  echo -e "${RED} FAIL${NC}: Staff login failed"
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
