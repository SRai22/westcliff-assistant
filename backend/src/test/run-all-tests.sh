#!/bin/bash

# Master Test Runner
# Executes all backend integration tests and provides summary

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

TOTAL_PASSED=0
TOTAL_FAILED=0
SUITE_COUNT=0
FAILED_SUITES=()

echo "========================================="
echo "Backend Integration Test Suite"
echo "========================================="
echo ""
echo "Running all integration tests..."
echo ""

run_test_suite() {
  local suite_name="$1"
  local test_script="$2"
  
  ((SUITE_COUNT++))
  echo -e "${BLUE}[$SUITE_COUNT] $suite_name${NC}"
  echo "-------------------------------------------"
  
  if [ ! -f "$test_script" ]; then
    echo -e "${RED}✗ Test script not found: $test_script${NC}"
    ((TOTAL_FAILED++))
    FAILED_SUITES+=("$suite_name (script not found)")
    echo ""
    return 1
  fi
  
  # Run the test and capture output
  OUTPUT=$(bash "$test_script" 2>&1)
  EXIT_CODE=$?
  
  # Extract pass/fail counts from output
  PASSED=$(echo "$OUTPUT" | grep -oP 'Passed:\s*\K\d+' | tail -1)
  FAILED=$(echo "$OUTPUT" | grep -oP 'Failed:\s*\K\d+' | tail -1)
  
  if [ -z "$PASSED" ]; then
    PASSED=0
  fi
  if [ -z "$FAILED" ]; then
    FAILED=0
  fi
  
  TOTAL_PASSED=$((TOTAL_PASSED + PASSED))
  TOTAL_FAILED=$((TOTAL_FAILED + FAILED))
  
  if [ $EXIT_CODE -eq 0 ] && [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Passed: $PASSED${NC}"
  else
    echo -e "${RED}✗ Passed: $PASSED, Failed: $FAILED${NC}"
    FAILED_SUITES+=("$suite_name")
  fi
  
  echo ""
}

# Run all test suites
run_test_suite "Auth Endpoints" "src/test/auth-endpoints.test.sh"
run_test_suite "RBAC Middleware" "src/test/rbac-middleware.test.sh"
run_test_suite "Ticket CRUD Routes" "src/test/ticket-routes.test.sh"
run_test_suite "Ticket Status Updates" "src/test/ticket-status-update.test.sh"
run_test_suite "Ticket Messages" "src/test/ticket-messages.test.sh"
run_test_suite "Knowledge Base Articles" "src/test/articles.test.sh"
run_test_suite "AI Proxy Endpoints" "src/test/ai-proxy.test.sh"
run_test_suite "WebSocket (Socket.io)" "src/test/socket.test.sh"

# Summary
echo "========================================="
echo "Test Summary"
echo "========================================="
echo ""
echo "Suites Run: $SUITE_COUNT"
echo -e "Total Passed: ${GREEN}$TOTAL_PASSED${NC}"
echo -e "Total Failed: ${RED}$TOTAL_FAILED${NC}"
echo ""

if [ ${#FAILED_SUITES[@]} -gt 0 ]; then
  echo -e "${RED}Failed Test Suites:${NC}"
  for suite in "${FAILED_SUITES[@]}"; do
    echo "  - $suite"
  done
  echo ""
  echo -e "${RED}Some tests failed.${NC}"
  exit 1
else
  echo -e "${GREEN}All tests passed! ${NC}"
  exit 0
fi
