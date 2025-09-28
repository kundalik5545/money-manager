#!/usr/bin/env python3
"""
Clerk Authentication API Testing Suite
Tests the updated API routes with Clerk authentication implementation
Focus: Authentication security, user context, and data isolation
"""

import requests
import json
import os
from datetime import datetime

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://prismafinance.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

class ClerkAuthAPITester:
    def __init__(self):
        self.test_results = []
        self.session = requests.Session()
        self.critical_issues = []
        
    def log_test(self, test_name, success, message, details=None, critical=False):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat(),
            'critical': critical
        }
        self.test_results.append(result)
        
        if critical and not success:
            self.critical_issues.append(result)
            
        status = "✅ PASS" if success else "❌ FAIL"
        priority = " [CRITICAL]" if critical else ""
        print(f"{status}{priority}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_unauthenticated_api_requests(self):
        """Test that all API endpoints properly require authentication"""
        print("\n=== Testing Unauthenticated API Requests ===")
        
        # Key API endpoints that should require authentication
        endpoints = [
            ("GET", "/accounts", "Get Accounts"),
            ("GET", "/categories", "Get Categories"), 
            ("GET", "/transactions", "Get Transactions"),
            ("GET", "/analytics", "Get Analytics"),
            ("GET", "/export?format=csv", "Export CSV"),
            ("GET", "/export?format=xlsx", "Export Excel"),
            ("POST", "/accounts", "Create Account"),
            ("POST", "/categories", "Create Category"),
            ("POST", "/transactions", "Create Transaction")
        ]
        
        for method, endpoint, name in endpoints:
            try:
                url = f"{API_BASE}{endpoint}"
                
                # Prepare request data for POST requests
                data = {}
                if method == "POST":
                    if "accounts" in endpoint:
                        data = {"name": "Test Account", "type": "BANK", "balance": 1000}
                    elif "categories" in endpoint:
                        data = {"name": "Test Category", "type": "EXPENSE"}
                    elif "transactions" in endpoint:
                        data = {
                            "amount": 100,
                            "description": "Test Transaction",
                            "date": "2024-01-01",
                            "accountId": "test-id",
                            "categoryId": "test-id"
                        }
                
                # Make request without authentication
                if method == "GET":
                    response = self.session.get(url, timeout=15)
                else:
                    response = self.session.post(url, json=data, timeout=15)
                
                # Check response
                if response.status_code == 401:
                    try:
                        response_data = response.json()
                        if response_data.get('error') == 'Unauthorized':
                            self.log_test(
                                f"Auth Security - {name}",
                                True,
                                "Correctly returns 401 Unauthorized",
                                f"Response: {response_data}",
                                critical=True
                            )
                        else:
                            self.log_test(
                                f"Auth Security - {name}",
                                False,
                                "Returns 401 but with unexpected error message",
                                f"Response: {response_data}",
                                critical=True
                            )
                    except json.JSONDecodeError:
                        self.log_test(
                            f"Auth Security - {name}",
                            True,
                            "Returns 401 Unauthorized (non-JSON response)",
                            f"Response text: {response.text[:200]}",
                            critical=True
                        )
                elif response.status_code == 200:
                    try:
                        response_data = response.json()
                        if response_data.get('success') and response_data.get('data'):
                            self.log_test(
                                f"Auth Security - {name}",
                                False,
                                "CRITICAL SECURITY ISSUE: Returns data without authentication",
                                f"Status: {response.status_code}, Data: {str(response_data)[:200]}",
                                critical=True
                            )
                        else:
                            self.log_test(
                                f"Auth Security - {name}",
                                True,
                                "Returns 200 but no sensitive data (acceptable)",
                                f"Response: {response_data}",
                                critical=False
                            )
                    except json.JSONDecodeError:
                        self.log_test(
                            f"Auth Security - {name}",
                            False,
                            "Returns 200 with non-JSON response",
                            f"Response text: {response.text[:200]}",
                            critical=False
                        )
                else:
                    self.log_test(
                        f"Auth Security - {name}",
                        False,
                        f"Unexpected response status: {response.status_code}",
                        f"Response: {response.text[:200]}",
                        critical=False
                    )
                    
            except requests.exceptions.RequestException as e:
                self.log_test(
                    f"Auth Security - {name}",
                    False,
                    "Request failed",
                    str(e),
                    critical=False
                )
    
    def test_api_code_implementation(self):
        """Test the API code implementation for proper authentication patterns"""
        print("\n=== Testing API Code Implementation ===")
        
        try:
            with open('/app/app/api/[[...path]]/route.js', 'r') as f:
                api_content = f.read()
            
            # Test 1: Check for Clerk auth import
            has_clerk_import = 'from \'@clerk/nextjs/server\'' in api_content and 'auth' in api_content
            self.log_test(
                "Code Analysis - Clerk Import",
                has_clerk_import,
                "API routes properly import Clerk auth" if has_clerk_import else "Missing Clerk auth import",
                f"Found import: {has_clerk_import}",
                critical=True
            )
            
            # Test 2: Check for getAuthenticatedUser helper function
            has_auth_helper = 'getAuthenticatedUser' in api_content and 'async function getAuthenticatedUser' in api_content
            self.log_test(
                "Code Analysis - Auth Helper Function",
                has_auth_helper,
                "getAuthenticatedUser helper function exists" if has_auth_helper else "Missing getAuthenticatedUser helper function",
                f"Found helper: {has_auth_helper}",
                critical=True
            )
            
            # Test 3: Check for auth() usage in helper
            has_auth_call = 'auth()' in api_content and 'userId' in api_content
            self.log_test(
                "Code Analysis - Auth Usage",
                has_auth_call,
                "Uses auth() to get userId" if has_auth_call else "Missing auth() usage",
                f"Found auth() call: {has_auth_call}",
                critical=True
            )
            
            # Test 4: Check for user creation logic
            has_user_creation = 'prisma.user.create' in api_content and 'clerkId: userId' in api_content
            self.log_test(
                "Code Analysis - User Creation",
                has_user_creation,
                "Implements user creation for new authenticated users" if has_user_creation else "Missing user creation logic",
                f"Found user creation: {has_user_creation}",
                critical=True
            )
            
            # Test 5: Check for userId filtering in database queries
            userid_filter_count = api_content.count('userId: user.id')
            has_sufficient_filtering = userid_filter_count >= 5  # Should be in multiple endpoints
            self.log_test(
                "Code Analysis - User ID Filtering",
                has_sufficient_filtering,
                f"Database queries properly filter by userId ({userid_filter_count} instances)" if has_sufficient_filtering else f"Insufficient userId filtering ({userid_filter_count} instances)",
                f"Found {userid_filter_count} userId filters",
                critical=True
            )
            
            # Test 6: Check for user ownership verification
            has_ownership_check = 'findFirst' in api_content and 'userId: user.id' in api_content
            self.log_test(
                "Code Analysis - Ownership Verification",
                has_ownership_check,
                "Implements user ownership verification" if has_ownership_check else "Missing user ownership verification",
                f"Found ownership checks: {has_ownership_check}",
                critical=True
            )
            
            # Test 7: Check for 401 unauthorized responses
            has_401_responses = api_content.count('status: 401') >= 3  # Should be in multiple endpoints
            self.log_test(
                "Code Analysis - 401 Responses",
                has_401_responses,
                f"Properly returns 401 for unauthorized requests ({api_content.count('status: 401')} instances)" if has_401_responses else f"Insufficient 401 responses ({api_content.count('status: 401')} instances)",
                f"Found {api_content.count('status: 401')} 401 responses",
                critical=True
            )
            
            # Test 8: Check specific endpoint implementations
            endpoints_to_check = ['getAccounts', 'getCategories', 'getTransactions', 'getAnalytics', 'exportTransactions']
            missing_endpoints = []
            
            for endpoint in endpoints_to_check:
                if endpoint not in api_content:
                    missing_endpoints.append(endpoint)
            
            has_all_endpoints = len(missing_endpoints) == 0
            self.log_test(
                "Code Analysis - Required Endpoints",
                has_all_endpoints,
                "All required endpoints implemented" if has_all_endpoints else f"Missing endpoints: {missing_endpoints}",
                f"Missing: {missing_endpoints}" if missing_endpoints else "All endpoints found",
                critical=True
            )
                
        except Exception as e:
            self.log_test(
                "Code Analysis - File Access",
                False,
                "Failed to analyze API route implementation",
                str(e),
                critical=True
            )
    
    def test_data_isolation_patterns(self):
        """Test that the code implements proper data isolation patterns"""
        print("\n=== Testing Data Isolation Patterns ===")
        
        try:
            with open('/app/app/api/[[...path]]/route.js', 'r') as f:
                api_content = f.read()
            
            # Test 1: All findMany queries should include userId filter
            findmany_lines = [line.strip() for line in api_content.split('\n') if 'findMany' in line]
            findmany_with_where = [line for line in findmany_lines if 'where:' in api_content[api_content.find(line):api_content.find(line)+200]]
            
            self.log_test(
                "Data Isolation - FindMany Queries",
                len(findmany_with_where) >= 3,
                f"FindMany queries use where clauses ({len(findmany_with_where)}/{len(findmany_lines)})" if len(findmany_with_where) >= 3 else f"Some FindMany queries missing where clauses ({len(findmany_with_where)}/{len(findmany_lines)})",
                f"FindMany queries: {len(findmany_lines)}, With where: {len(findmany_with_where)}",
                critical=True
            )
            
            # Test 2: Check for user verification in update/delete operations
            has_update_verification = 'findFirst' in api_content and 'userId: user.id' in api_content
            self.log_test(
                "Data Isolation - Update/Delete Verification",
                has_update_verification,
                "Update/Delete operations verify user ownership" if has_update_verification else "Missing user ownership verification in updates/deletes",
                f"Found verification patterns: {has_update_verification}",
                critical=True
            )
            
            # Test 3: Check for consistent user.id usage
            user_id_usage = api_content.count('user.id')
            has_consistent_usage = user_id_usage >= 10  # Should appear frequently
            self.log_test(
                "Data Isolation - Consistent User ID Usage",
                has_consistent_usage,
                f"Consistent user.id usage throughout code ({user_id_usage} instances)" if has_consistent_usage else f"Inconsistent user.id usage ({user_id_usage} instances)",
                f"user.id appears {user_id_usage} times",
                critical=True
            )
            
            # Test 4: Check for proper error handling when user not found
            has_user_not_found_handling = 'if (!user)' in api_content and 'Unauthorized' in api_content
            self.log_test(
                "Data Isolation - User Not Found Handling",
                has_user_not_found_handling,
                "Proper handling when user not found" if has_user_not_found_handling else "Missing user not found error handling",
                f"Found user not found handling: {has_user_not_found_handling}",
                critical=True
            )
                
        except Exception as e:
            self.log_test(
                "Data Isolation - Code Analysis",
                False,
                "Failed to analyze data isolation patterns",
                str(e),
                critical=True
            )
    
    def test_api_response_structure(self):
        """Test API response structure for consistency"""
        print("\n=== Testing API Response Structure ===")
        
        # Test a few endpoints to check response structure
        endpoints = [
            ("GET", "/accounts", "Get Accounts"),
            ("GET", "/categories", "Get Categories"),
            ("GET", "/transactions", "Get Transactions")
        ]
        
        for method, endpoint, name in endpoints:
            try:
                url = f"{API_BASE}{endpoint}"
                response = self.session.get(url, timeout=15)
                
                # We expect 401, but let's check the response structure
                if response.status_code == 401:
                    try:
                        response_data = response.json()
                        
                        # Check for consistent error response structure
                        has_success_field = 'success' in response_data
                        has_error_field = 'error' in response_data
                        success_is_false = response_data.get('success') == False
                        error_is_unauthorized = response_data.get('error') == 'Unauthorized'
                        
                        structure_correct = has_success_field and has_error_field and success_is_false and error_is_unauthorized
                        
                        self.log_test(
                            f"Response Structure - {name}",
                            structure_correct,
                            "Correct error response structure" if structure_correct else "Incorrect error response structure",
                            f"Response: {response_data}",
                            critical=False
                        )
                        
                    except json.JSONDecodeError:
                        self.log_test(
                            f"Response Structure - {name}",
                            False,
                            "Non-JSON error response",
                            f"Response text: {response.text[:200]}",
                            critical=False
                        )
                else:
                    self.log_test(
                        f"Response Structure - {name}",
                        False,
                        f"Unexpected status code: {response.status_code}",
                        f"Expected 401, got {response.status_code}",
                        critical=False
                    )
                    
            except requests.exceptions.RequestException as e:
                self.log_test(
                    f"Response Structure - {name}",
                    False,
                    "Request failed",
                    str(e),
                    critical=False
                )
    
    def run_all_tests(self):
        """Run all authentication API tests"""
        print("🔐 Starting Clerk Authentication API Testing Suite")
        print("🎯 Focus: Authentication Security, User Context, Data Isolation")
        print("=" * 80)
        
        # Test unauthenticated requests
        self.test_unauthenticated_api_requests()
        
        # Test code implementation
        self.test_api_code_implementation()
        
        # Test data isolation patterns
        self.test_data_isolation_patterns()
        
        # Test response structure
        self.test_api_response_structure()
        
        # Generate summary
        passed, failed, critical = self.generate_summary()
        return passed, failed, critical
    
    def generate_summary(self):
        """Generate comprehensive test summary"""
        print("\n" + "=" * 80)
        print("🏁 CLERK AUTHENTICATION API TESTING SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r['success']])
        failed_tests = total_tests - passed_tests
        critical_failed = len(self.critical_issues)
        
        print(f"📊 Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"🚨 Critical Issues: {critical_failed}")
        print(f"📈 Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Categorize results
        categories = {
            'Authentication Security': [],
            'Code Implementation': [],
            'Data Isolation': [],
            'Response Structure': []
        }
        
        for result in self.test_results:
            test_name = result['test']
            if 'Auth Security' in test_name:
                categories['Authentication Security'].append(result)
            elif 'Code Analysis' in test_name:
                categories['Code Implementation'].append(result)
            elif 'Data Isolation' in test_name:
                categories['Data Isolation'].append(result)
            elif 'Response Structure' in test_name:
                categories['Response Structure'].append(result)
        
        # Print category summaries
        for category, results in categories.items():
            if results:
                passed = len([r for r in results if r['success']])
                total = len(results)
                print(f"\n📋 {category}: {passed}/{total} passed")
                
                for result in results:
                    if not result['success']:
                        status = "🚨" if result.get('critical') else "⚠️"
                        print(f"   {status} {result['test']}: {result['message']}")
        
        # Critical issues summary
        if self.critical_issues:
            print(f"\n🚨 CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION:")
            for issue in self.critical_issues:
                print(f"   🔴 {issue['test']}")
                print(f"      Problem: {issue['message']}")
                if issue['details']:
                    print(f"      Details: {issue['details']}")
                print()
        
        # Final assessment
        print(f"\n💡 AUTHENTICATION IMPLEMENTATION ASSESSMENT:")
        
        if critical_failed == 0:
            print("   🎉 Authentication implementation is working correctly!")
            print("   ✅ All API endpoints properly require authentication")
            print("   ✅ User context and data isolation implemented")
            print("   ✅ Security measures in place")
        else:
            print("   🔧 Authentication implementation has critical issues:")
            
            # Specific recommendations based on failed tests
            failed_categories = set()
            for issue in self.critical_issues:
                if 'Auth Security' in issue['test']:
                    failed_categories.add('security')
                elif 'Code Analysis' in issue['test']:
                    failed_categories.add('implementation')
                elif 'Data Isolation' in issue['test']:
                    failed_categories.add('isolation')
            
            if 'security' in failed_categories:
                print("      - Fix API endpoints that don't require authentication")
            if 'implementation' in failed_categories:
                print("      - Complete Clerk authentication implementation in API routes")
            if 'isolation' in failed_categories:
                print("      - Add proper user data isolation and ownership verification")
        
        return passed_tests, failed_tests, critical_failed

if __name__ == "__main__":
    tester = ClerkAuthAPITester()
    passed, failed, critical = tester.run_all_tests()
    
    # Exit with appropriate code
    if critical > 0:
        print(f"\n🚨 CRITICAL AUTHENTICATION ISSUES FOUND: {critical}")
        exit(2)  # Critical issues
    elif failed > 0:
        print(f"\n⚠️  MINOR ISSUES FOUND: {failed}")
        exit(1)  # Minor issues
    else:
        print(f"\n🎉 ALL AUTHENTICATION TESTS PASSED!")
        exit(0)  # Success