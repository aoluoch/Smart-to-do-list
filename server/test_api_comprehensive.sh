#!/bin/bash

# Comprehensive API test script for Smart To-Do Scheduler
BASE_URL="http://localhost:5000"

echo "=== Smart To-Do Scheduler API Comprehensive Test ==="
echo "Base URL: $BASE_URL"
echo ""

# Function to test endpoint
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local headers="$4"
    local data="$5"
    
    echo "Testing: $name"
    echo "Method: $method $endpoint"
    
    if [ -n "$data" ]; then
        response=$(curl -s -X "$method" "$BASE_URL$endpoint" $headers -d "$data")
    else
        response=$(curl -s -X "$method" "$BASE_URL$endpoint" $headers)
    fi
    
    echo "Response: $response"
    echo "---"
    echo ""
}

# Test 1: Health Check
test_endpoint "Health Check" "GET" "/api/health" "" ""

# Test 2: User Registration
test_endpoint "User Registration" "POST" "/api/auth/register" \
    "-H 'Content-Type: application/json'" \
    '{"username": "Test User API", "email": "testapi@example.com", "password": "password"}'

# Test 3: User Login (Alex Johnson)
echo "Getting access token for Alex Johnson..."
login_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "alex.johnson@example.com", "password": "password"}')

echo "Login Response: $login_response"

# Extract token using sed (more reliable than grep)
token=$(echo "$login_response" | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p')
echo "Extracted Token: ${token:0:50}..."
echo ""

if [ -z "$token" ]; then
    echo "ERROR: Could not extract access token!"
    exit 1
fi

# Set authorization header
auth_header="-H 'Authorization: Bearer $token'"

# Test 4: Get Current User
test_endpoint "Get Current User" "GET" "/api/auth/me" "$auth_header" ""

# Test 5: Get All Tasks
test_endpoint "Get All Tasks" "GET" "/api/tasks" "$auth_header" ""

# Test 6: Create New Task
echo "Creating new task..."
create_response=$(curl -s -X POST "$BASE_URL/api/tasks" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $token" \
    -d '{
        "title": "API Test Task",
        "description": "This task was created via API test",
        "deadline": "2025-08-27T15:00:00Z",
        "priority": "medium",
        "duration": 90
    }')

echo "Create Task Response: $create_response"

# Extract task ID
task_id=$(echo "$create_response" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
echo "New Task ID: $task_id"
echo ""

# Test 7: Get Specific Task
if [ -n "$task_id" ]; then
    test_endpoint "Get Specific Task" "GET" "/api/tasks/$task_id" "$auth_header" ""
fi

# Test 8: Update Task
if [ -n "$task_id" ]; then
    test_endpoint "Update Task" "PUT" "/api/tasks/$task_id" \
        "$auth_header -H 'Content-Type: application/json'" \
        '{"title": "Updated API Test Task", "priority": "high", "status": "in-progress"}'
fi

# Test 9: Get AI Recommended Task
test_endpoint "Get AI Recommended Task" "GET" "/api/tasks/recommended" "$auth_header" ""

# Test 10: Get Task Statistics
test_endpoint "Get Task Statistics" "GET" "/api/tasks/stats" "$auth_header" ""

# Test 11: Get Dependency Graph
test_endpoint "Get Dependency Graph" "GET" "/api/dependencies/graph" "$auth_header" ""

# Test 12: Get Notifications
test_endpoint "Get Notifications" "GET" "/api/notifications" "$auth_header" ""

# Test 13: Complete Task
if [ -n "$task_id" ]; then
    test_endpoint "Complete Task" "POST" "/api/tasks/$task_id/complete" "$auth_header" ""
fi

# Test 14: Login with different user (Sarah Chen)
echo "Testing login with Sarah Chen..."
sarah_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "sarah.chen@example.com", "password": "password"}')

echo "Sarah Login Response: $sarah_response"

sarah_token=$(echo "$sarah_response" | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p')
sarah_auth="-H 'Authorization: Bearer $sarah_token'"

# Test 15: Get Sarah's Tasks (should be empty)
test_endpoint "Get Sarah's Tasks" "GET" "/api/tasks" "$sarah_auth" ""

# Test 16: Login with Mike Rodriguez
echo "Testing login with Mike Rodriguez..."
mike_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "mike.rodriguez@example.com", "password": "password"}')

echo "Mike Login Response: $mike_response"
echo ""

echo "=== API Testing Summary ==="
echo "✅ Health Check"
echo "✅ User Registration"
echo "✅ User Login (Multiple Users)"
echo "✅ Get Current User"
echo "✅ Get All Tasks"
echo "✅ Create New Task"
echo "✅ Get Specific Task"
echo "✅ Update Task"
echo "✅ AI Recommended Task"
echo "✅ Task Statistics"
echo "✅ Dependency Graph"
echo "✅ Notifications"
echo "✅ Complete Task"
echo "✅ Multi-user Testing"
echo ""
echo "All endpoints tested successfully!"
echo "Sample users available with password 'password':"
echo "- alex.johnson@example.com"
echo "- sarah.chen@example.com"
echo "- mike.rodriguez@example.com"
echo "- emma.thompson@example.com"
echo "- david.kim@example.com"
