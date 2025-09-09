#!/bin/bash

# Simple API test script
BASE_URL="http://localhost:5000"

echo "=== Testing Smart To-Do Scheduler API ==="
echo ""

# Test 1: Health Check
echo "1. Health Check:"
curl -s -X GET "$BASE_URL/api/health"
echo -e "\n"

# Test 2: Login
echo "2. Login (Alex Johnson):"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "alex.johnson@example.com", "password": "password"}')
echo "$LOGIN_RESPONSE"
echo ""

# Extract token (simple grep method)
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
echo "Extracted Token: ${TOKEN:0:50}..."
echo ""

# Test 3: Get Current User
echo "3. Get Current User:"
curl -s -X GET "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

# Test 4: Get All Tasks
echo "4. Get All Tasks:"
curl -s -X GET "$BASE_URL/api/tasks" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

# Test 5: Create New Task
echo "5. Create New Task:"
NEW_TASK_RESPONSE=$(curl -s -X POST "$BASE_URL/api/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "API Test Task",
    "description": "Created via curl test",
    "deadline": "2025-08-27T12:00:00Z",
    "priority": "medium",
    "duration": 60
  }')
echo "$NEW_TASK_RESPONSE"
echo ""

# Extract task ID
TASK_ID=$(echo "$NEW_TASK_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "New Task ID: $TASK_ID"
echo ""

# Test 6: Get Specific Task
echo "6. Get Specific Task:"
curl -s -X GET "$BASE_URL/api/tasks/$TASK_ID" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

# Test 7: Get AI Recommended Task
echo "7. Get AI Recommended Task:"
curl -s -X GET "$BASE_URL/api/tasks/recommended" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

# Test 8: Get Task Statistics
echo "8. Get Task Statistics:"
curl -s -X GET "$BASE_URL/api/tasks/stats" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

# Test 9: Get Notifications
echo "9. Get Notifications:"
curl -s -X GET "$BASE_URL/api/notifications" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

# Test 10: Complete Task
echo "10. Complete Task:"
curl -s -X POST "$BASE_URL/api/tasks/$TASK_ID/complete" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

# Test 11: Login with different user
echo "11. Login (Sarah Chen):"
SARAH_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "sarah.chen@example.com", "password": "password"}')
echo "$SARAH_LOGIN"
echo ""

# Test 12: Register new user
echo "12. Register New User:"
curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Test User",
    "email": "test.user@example.com",
    "password": "password"
  }'
echo -e "\n"

echo "=== API Testing Complete ==="
