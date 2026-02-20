#!/bin/bash

# Socket.io WebSocket Integration Tests Wrapper
# This script runs the Node.js-based WebSocket tests

echo "Running Socket.io WebSocket Integration Tests..."
echo ""

node src/test/socket.test.mjs

exit $?
