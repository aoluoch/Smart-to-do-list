#!/bin/bash

# Test script for Smart To-Do Scheduler API endpoints
# Tests all endpoints with sample data

BASE_URL="http://localhost:5000"
echo "Testing Smart To-Do Scheduler API at $BASE_URL"
echo "=================================================="

# Test 1: Health Check
echo "1. Testing Health Check..."
curl -s -X GET "$BASE_URL/api/health" | jq '.'
echo ""

# Test 2: User Login (Alex Johnson)
echo "2. Testing User Login (Alex Johnson)..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "alex.johnson@example.com", "password": "password"}')

echo "$LOGIN_RESPONSE" | jq '.'

# Extract access token
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
echo "Access Token: $ACCESS_TOKEN"
echo ""

# Test 3: Get Current User
echo "3. Testing Get Current User..."
curl -s -X GET "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
echo ""

# Test 4: Get All Tasks
echo "4. Testing Get All Tasks..."
curl -s -X GET "$BASE_URL/api/tasks" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
echo ""

# Test 5: Create New Task
echo "5. Testing Create New Task..."
NEW_TASK_RESPONSE=$(curl -s -X POST "$BASE_URL/api/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "title": "Test API Task",
    "description": "This task was created via API test",
    "deadline": "2025-08-27T12:00:00Z",
    "priority": "medium",
    "duration": 60,
    "dependencies": []
  }')

echo "$NEW_TASK_RESPONSE" | jq '.'

# Extract new task ID
NEW_TASK_ID=$(echo "$NEW_TASK_RESPONSE" | jq -r '.task.id')
echo "New Task ID: $NEW_TASK_ID"
echo ""

# Test 6: Get Specific Task
echo "6. Testing Get Specific Task..."
curl -s -X GET "$BASE_URL/api/tasks/$NEW_TASK_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
echo ""

# Test 7: Update Task
echo "7. Testing Update Task..."
curl -s -X PUT "$BASE_URL/api/tasks/$NEW_TASK_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "title": "Updated Test API Task",
    "description": "This task was updated via API test",
    "deadline": "2025-08-27T15:00:00Z",
    "priority": "high",
    "duration": 90,
    "status": "in-progress"
  }' | jq '.'
echo ""

# Test 8: Get AI Recommended Task
echo "8. Testing Get AI Recommended Task..."
curl -s -X GET "$BASE_URL/api/tasks/recommended" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
echo ""

# Test 9: Get Task Statistics
echo "9. Testing Get Task Statistics..."
curl -s -X GET "$BASE_URL/api/tasks/stats" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
echo ""

# Test 10: Get Dependency Graph
echo "10. Testing Get Dependency Graph..."
curl -s -X GET "$BASE_URL/api/dependencies/graph" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
echo ""

# Test 11: Get Notifications
echo "11. Testing Get Notifications..."
curl -s -X GET "$BASE_URL/api/notifications" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
echo ""

# Test 12: Complete Task
echo "12. Testing Complete Task..."
curl -s -X POST "$BASE_URL/api/tasks/$NEW_TASK_ID/complete" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
echo ""

# Test 13: Test with different user (Sarah Chen)
echo "13. Testing Login with Different User (Sarah Chen)..."
SARAH_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "sarah.chen@example.com", "password": "password"}')

echo "$SARAH_LOGIN_RESPONSE" | jq '.'

SARAH_TOKEN=$(echo "$SARAH_LOGIN_RESPONSE" | jq -r '.access_token')
echo "Sarah's Access Token: $SARAH_TOKEN"
echo ""

# Test 14: Get Sarah's Tasks (should be empty)
echo "14. Testing Get Sarah's Tasks (should be empty)..."
curl -s -X GET "$BASE_URL/api/tasks" \
  -H "Authorization: Bearer $SARAH_TOKEN" | jq '.'
echo ""

# Test 15: Register New User
echo "15. Testing Register New User..."
curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Test User",
    "email": "test.user@example.com",
    "password": "password",
    "workCapacity": 6,
    "emailReminders": true
  }' | jq '.'
echo ""

echo "=================================================="
echo "API Testing Complete!"
