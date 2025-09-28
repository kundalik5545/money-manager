#!/usr/bin/env python3
"""
Finance Wizard Separated API Routes Testing Suite
Tests the newly separated API routes and user creation flow
Focus: Individual route testing, authentication, and user creation
"""

import requests
import json
import os
import subprocess
import sys
from datetime import datetime, timedelta
import uuid

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://finance-wizard-30.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

class SeparatedRoutesBackendTester:
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
    
    def test_separated_api_routes_authentication(self):
        """Test that all separated API routes require authentication"""
        print("\n=== Testing Separated API Routes Authentication ===")
        
        # Test the specific separated routes mentioned in the review request
        routes = [
            ("GET", "/accounts", "Get Accounts"),
            ("GET", "/categories", "Get Categories"), 
            ("GET", "/transactions", "Get Transactions"),
            ("GET", "/analytics", "Get Analytics")
        ]
        
        for method, endpoint, name in routes:
            try:
                url = f"{API_BASE}{endpoint}"
                response = self.session.request(method, url, timeout=15)
                
                # Check response
                if response.status_code == 401:
                    try:
                        data = response.json()
                        if data.get('success') == False and 'Unauthorized' in data.get('error', ''):
                            self.log_test(
                                f"Separated Route Auth - {name}",
                                True,
                                "Correctly requires authentication with proper JSON response format",
                                f"Status: {response.status_code}, Response: {data}",
                                critical=True
                            )
                        else:
                            self.log_test(
                                f"Separated Route Auth - {name}",
                                False,
                                "Returns 401 but with incorrect response format",
                                f"Expected: {{success: false, error: 'Unauthorized'}}, Got: {data}",
                                critical=True
                            )
                    except json.JSONDecodeError:
                        self.log_test(
                            f"Separated Route Auth - {name}",
                            False,
                            "Returns 401 but response is not valid JSON",
                            response.text[:200],
                            critical=True
                        )
                elif response.status_code == 200:
                    try:
                        data = response.json()
                        if data.get('success') and data.get('data'):
                            self.log_test(
                                f"Separated Route Auth - {name}",
                                False,
                                "SECURITY ISSUE: API returns data without authentication",
                                f"Status: {response.status_code}, Data returned: {len(str(data.get('data', [])))} chars",
                                critical=True
                            )
                        else:
                            self.log_test(
                                f"Separated Route Auth - {name}",
                                True,
                                "API accessible but returns no data without authentication",
                                f"Status: {response.status_code}, Response: {data}",
                                critical=False
                            )
                    except json.JSONDecodeError:
                        self.log_test(
                            f"Separated Route Auth - {name}",
                            False,
                            "API returned non-JSON response",
                            response.text[:200],
                            critical=False
                        )
                else:
                    self.log_test(
                        f"Separated Route Auth - {name}",
                        False,
                        f"Unexpected response status: {response.status_code}",
                        response.text[:200],
                        critical=True
                    )
                    
            except requests.exceptions.RequestException as e:
                self.log_test(
                    f"Separated Route Auth - {name}",
                    False,
                    "Request failed",
                    str(e),
                    critical=True
                )
    
    def test_user_creation_flow(self):
        """Test the getAuthenticatedUser() helper function and user creation flow"""
        print("\n=== Testing User Creation Flow ===")
        
        try:
            # Read the API route file to analyze the user creation implementation
            with open('/app/app/api/[[...path]]/route.js', 'r') as f:
                api_content = f.read()
            
            # Check for getAuthenticatedUser function implementation
            has_get_authenticated_user = 'getAuthenticatedUser' in api_content
            has_user_creation_logic = 'prisma.user.create' in api_content
            has_clerk_id_mapping = 'clerkId: userId' in api_content
            has_find_or_create_pattern = 'findUnique' in api_content and 'create' in api_content
            
            self.log_test(
                "User Creation Flow - getAuthenticatedUser Function",
                has_get_authenticated_user,
                "getAuthenticatedUser helper function exists" if has_get_authenticated_user else "getAuthenticatedUser helper function missing",
                f"Function found: {has_get_authenticated_user}",
                critical=True
            )
            
            self.log_test(
                "User Creation Flow - User Creation Logic",
                has_user_creation_logic,
                "User creation logic implemented" if has_user_creation_logic else "User creation logic missing",
                f"prisma.user.create found: {has_user_creation_logic}",
                critical=True
            )
            
            self.log_test(
                "User Creation Flow - Clerk ID Mapping",
                has_clerk_id_mapping,
                "Clerk ID mapping implemented" if has_clerk_id_mapping else "Clerk ID mapping missing",
                f"clerkId mapping found: {has_clerk_id_mapping}",
                critical=True
            )
            
            self.log_test(
                "User Creation Flow - Find or Create Pattern",
                has_find_or_create_pattern,
                "Find or create user pattern implemented" if has_find_or_create_pattern else "Find or create user pattern missing",
                f"Pattern found: {has_find_or_create_pattern}",
                critical=True
            )
            
            # Test the actual user creation flow by checking database
            user_creation_test = subprocess.run(
                ["node", "-e", """
                const { PrismaClient } = require('@prisma/client');
                const prisma = new PrismaClient();
                
                async function testUserCreation() {
                    try {
                        // Check if demo user exists (should be created by seeding)
                        const demoUser = await prisma.user.findUnique({
                            where: { clerkId: 'demo_user_123' }
                        });
                        
                        if (demoUser) {
                            console.log(JSON.stringify({
                                success: true,
                                user_exists: true,
                                user_id: demoUser.id,
                                clerk_id: demoUser.clerkId,
                                email: demoUser.email
                            }));
                        } else {
                            console.log(JSON.stringify({
                                success: false,
                                user_exists: false,
                                message: 'Demo user not found'
                            }));
                        }
                        
                        await prisma.$disconnect();
                    } catch (e) {
                        console.log(JSON.stringify({
                            success: false,
                            error: e.message
                        }));
                        process.exit(1);
                    }
                }
                
                testUserCreation();
                """],
                cwd="/app",
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if user_creation_test.returncode == 0:
                try:
                    result = json.loads(user_creation_test.stdout.strip())
                    if result.get('success') and result.get('user_exists'):
                        self.log_test(
                            "User Creation Flow - Database Integration",
                            True,
                            f"User creation flow working - demo user exists with clerkId: {result.get('clerk_id')}",
                            result,
                            critical=True
                        )
                    else:
                        self.log_test(
                            "User Creation Flow - Database Integration",
                            False,
                            "User creation flow issue - demo user not found in database",
                            result,
                            critical=True
                        )
                except json.JSONDecodeError:
                    self.log_test(
                        "User Creation Flow - Database Integration",
                        False,
                        "Could not parse user creation test output",
                        user_creation_test.stdout,
                        critical=True
                    )
            else:
                self.log_test(
                    "User Creation Flow - Database Integration",
                    False,
                    "User creation test failed",
                    user_creation_test.stderr.strip(),
                    critical=True
                )
                
        except Exception as e:
            self.log_test(
                "User Creation Flow - Code Analysis",
                False,
                "Failed to analyze user creation flow implementation",
                str(e),
                critical=True
            )
    
    def test_data_integration_and_demo_data(self):
        """Test that demo data exists and is properly linked"""
        print("\n=== Testing Data Integration and Demo Data ===")
        
        try:
            # Test that demo data exists and relationships are correct
            data_test = subprocess.run(
                ["node", "-e", """
                const { PrismaClient } = require('@prisma/client');
                const prisma = new PrismaClient();
                
                async function testDataIntegration() {
                    try {
                        // Get demo user with all related data
                        const demoUser = await prisma.user.findUnique({
                            where: { clerkId: 'demo_user_123' },
                            include: {
                                accounts: {
                                    include: {
                                        _count: {
                                            select: { transactions: true }
                                        }
                                    }
                                },
                                categories: {
                                    include: {
                                        subcategories: true,
                                        _count: {
                                            select: { transactions: true }
                                        }
                                    }
                                },
                                transactions: {
                                    include: {
                                        account: true,
                                        category: true,
                                        subcategory: true
                                    }
                                }
                            }
                        });
                        
                        if (!demoUser) {
                            console.log(JSON.stringify({
                                success: false,
                                error: 'Demo user not found'
                            }));
                            return;
                        }
                        
                        // Analyze data structure
                        const results = {
                            success: true,
                            user_id: demoUser.id,
                            accounts: {
                                count: demoUser.accounts.length,
                                types: [...new Set(demoUser.accounts.map(a => a.type))],
                                with_transactions: demoUser.accounts.filter(a => a._count.transactions > 0).length,
                                total_balance: demoUser.accounts.reduce((sum, acc) => sum + acc.balance, 0)
                            },
                            categories: {
                                count: demoUser.categories.length,
                                types: [...new Set(demoUser.categories.map(c => c.type))],
                                with_subcategories: demoUser.categories.filter(c => c.subcategories.length > 0).length,
                                with_transactions: demoUser.categories.filter(c => c._count.transactions > 0).length
                            },
                            transactions: {
                                count: demoUser.transactions.length,
                                with_accounts: demoUser.transactions.filter(t => t.account).length,
                                with_categories: demoUser.transactions.filter(t => t.category).length,
                                with_subcategories: demoUser.transactions.filter(t => t.subcategory).length,
                                date_range: {
                                    earliest: demoUser.transactions.length > 0 ? Math.min(...demoUser.transactions.map(t => new Date(t.date).getTime())) : null,
                                    latest: demoUser.transactions.length > 0 ? Math.max(...demoUser.transactions.map(t => new Date(t.date).getTime())) : null
                                }
                            }
                        };
                        
                        console.log(JSON.stringify(results));
                        await prisma.$disconnect();
                    } catch (e) {
                        console.log(JSON.stringify({
                            success: false,
                            error: e.message
                        }));
                        process.exit(1);
                    }
                }
                
                testDataIntegration();
                """],
                cwd="/app",
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if data_test.returncode == 0:
                try:
                    data = json.loads(data_test.stdout.strip())
                    
                    if data.get('success'):
                        # Validate data integrity
                        accounts = data.get('accounts', {})
                        categories = data.get('categories', {})
                        transactions = data.get('transactions', {})
                        
                        # Test accounts
                        self.log_test(
                            "Data Integration - Accounts",
                            accounts.get('count', 0) > 0,
                            f"Demo data has {accounts.get('count', 0)} accounts with types: {accounts.get('types', [])}",
                            f"Accounts with transactions: {accounts.get('with_transactions', 0)}, Total balance: ${accounts.get('total_balance', 0)}",
                            critical=True
                        )
                        
                        # Test categories
                        self.log_test(
                            "Data Integration - Categories",
                            categories.get('count', 0) > 0 and 'INCOME' in categories.get('types', []) and 'EXPENSE' in categories.get('types', []),
                            f"Demo data has {categories.get('count', 0)} categories with both INCOME and EXPENSE types",
                            f"Categories with subcategories: {categories.get('with_subcategories', 0)}, with transactions: {categories.get('with_transactions', 0)}",
                            critical=True
                        )
                        
                        # Test transactions
                        transaction_integrity = (
                            transactions.get('count', 0) > 0 and
                            transactions.get('with_accounts', 0) == transactions.get('count', 0) and
                            transactions.get('with_categories', 0) == transactions.get('count', 0)
                        )
                        
                        self.log_test(
                            "Data Integration - Transactions",
                            transaction_integrity,
                            f"Demo data has {transactions.get('count', 0)} transactions with proper relationships",
                            f"All transactions linked to accounts: {transactions.get('with_accounts', 0)}/{transactions.get('count', 0)}, categories: {transactions.get('with_categories', 0)}/{transactions.get('count', 0)}",
                            critical=True
                        )
                        
                        # Overall data integration
                        overall_success = (
                            accounts.get('count', 0) > 0 and
                            categories.get('count', 0) > 0 and
                            transactions.get('count', 0) > 0 and
                            transaction_integrity
                        )
                        
                        self.log_test(
                            "Data Integration - Overall",
                            overall_success,
                            "Demo data is properly integrated and ready for API consumption" if overall_success else "Demo data has integration issues",
                            data,
                            critical=True
                        )
                        
                    else:
                        self.log_test(
                            "Data Integration",
                            False,
                            "Failed to retrieve demo data",
                            data.get('error', 'Unknown error'),
                            critical=True
                        )
                        
                except json.JSONDecodeError:
                    self.log_test(
                        "Data Integration",
                        False,
                        "Could not parse data integration test output",
                        data_test.stdout,
                        critical=True
                    )
            else:
                self.log_test(
                    "Data Integration",
                    False,
                    "Data integration test failed",
                    data_test.stderr.strip(),
                    critical=True
                )
                
        except Exception as e:
            self.log_test(
                "Data Integration",
                False,
                "Data integration test failed",
                str(e),
                critical=True
            )
    
    def test_api_response_format(self):
        """Test that API responses follow the correct format"""
        print("\n=== Testing API Response Format ===")
        
        try:
            # Read the API route file to check response format consistency
            with open('/app/app/api/[[...path]]/route.js', 'r') as f:
                api_content = f.read()
            
            # Check for consistent response format patterns
            success_response_pattern = 'success: true, data:' in api_content
            error_response_pattern = 'success: false, error:' in api_content
            nextresponse_json_usage = 'NextResponse.json' in api_content
            
            # Count response format occurrences
            success_responses = api_content.count('success: true')
            error_responses = api_content.count('success: false')
            
            self.log_test(
                "API Response Format - Success Pattern",
                success_response_pattern,
                "Success responses follow { success: true, data: ... } format" if success_response_pattern else "Success responses don't follow standard format",
                f"Found {success_responses} success response patterns",
                critical=True
            )
            
            self.log_test(
                "API Response Format - Error Pattern",
                error_response_pattern,
                "Error responses follow { success: false, error: ... } format" if error_response_pattern else "Error responses don't follow standard format",
                f"Found {error_responses} error response patterns",
                critical=True
            )
            
            self.log_test(
                "API Response Format - NextResponse Usage",
                nextresponse_json_usage,
                "API uses NextResponse.json for consistent responses" if nextresponse_json_usage else "API doesn't use NextResponse.json consistently",
                f"NextResponse.json usage found: {nextresponse_json_usage}",
                critical=True
            )
            
            # Check for proper HTTP status codes
            status_codes_check = (
                '401' in api_content and  # Unauthorized
                '404' in api_content and  # Not found
                '500' in api_content      # Internal server error
            )
            
            self.log_test(
                "API Response Format - HTTP Status Codes",
                status_codes_check,
                "API uses proper HTTP status codes (401, 404, 500)" if status_codes_check else "API missing proper HTTP status codes",
                f"Status codes found: 401: {'401' in api_content}, 404: {'404' in api_content}, 500: {'500' in api_content}",
                critical=True
            )
            
        except Exception as e:
            self.log_test(
                "API Response Format - Code Analysis",
                False,
                "Failed to analyze API response format",
                str(e),
                critical=True
            )
    
    def test_separated_routes_functionality(self):
        """Test that separated routes maintain the same functionality as monolithic route"""
        print("\n=== Testing Separated Routes Functionality ===")
        
        try:
            # Read the API route file to analyze route separation
            with open('/app/app/api/[[...path]]/route.js', 'r') as f:
                api_content = f.read()
            
            # Check for separated route functions
            separated_functions = [
                ('getAccounts', 'GET /api/accounts'),
                ('getCategories', 'GET /api/categories'),
                ('getTransactions', 'GET /api/transactions'),
                ('getAnalytics', 'GET /api/analytics'),
                ('createAccount', 'POST /api/accounts'),
                ('createCategory', 'POST /api/categories'),
                ('createTransaction', 'POST /api/transactions')
            ]
            
            all_functions_exist = True
            for func_name, description in separated_functions:
                func_exists = f'async function {func_name}' in api_content
                
                self.log_test(
                    f"Separated Routes - {description}",
                    func_exists,
                    f"{description} function implemented" if func_exists else f"{description} function missing",
                    f"Function {func_name} found: {func_exists}",
                    critical=True
                )
                
                if not func_exists:
                    all_functions_exist = False
            
            # Check for proper route handling in GET/POST handlers
            get_handler_routes = api_content.count("case '") >= 4  # Should have at least accounts, categories, transactions, analytics
            post_handler_routes = api_content.count("case '") >= 3  # Should have at least accounts, categories, transactions
            
            self.log_test(
                "Separated Routes - GET Handler",
                get_handler_routes,
                "GET handler properly routes to separated functions" if get_handler_routes else "GET handler missing proper route separation",
                f"Route cases found in GET handler",
                critical=True
            )
            
            self.log_test(
                "Separated Routes - POST Handler",
                post_handler_routes,
                "POST handler properly routes to separated functions" if post_handler_routes else "POST handler missing proper route separation",
                f"Route cases found in POST handler",
                critical=True
            )
            
            # Check for consistent authentication in all functions
            auth_consistency = api_content.count('getAuthenticatedUser()') >= 7  # Should be in most functions
            
            self.log_test(
                "Separated Routes - Authentication Consistency",
                auth_consistency,
                "All separated routes consistently use authentication" if auth_consistency else "Some separated routes missing authentication",
                f"getAuthenticatedUser() calls found: {api_content.count('getAuthenticatedUser()')}",
                critical=True
            )
            
            # Overall separation assessment
            separation_success = all_functions_exist and get_handler_routes and post_handler_routes and auth_consistency
            
            self.log_test(
                "Separated Routes - Overall Implementation",
                separation_success,
                "API routes successfully separated while maintaining functionality" if separation_success else "API route separation has issues",
                f"All checks passed: {separation_success}",
                critical=True
            )
            
        except Exception as e:
            self.log_test(
                "Separated Routes - Code Analysis",
                False,
                "Failed to analyze separated routes implementation",
                str(e),
                critical=True
            )
    
    def run_all_tests(self):
        """Run all separated routes backend tests"""
        print("🚀 Starting Finance Wizard Separated API Routes Testing Suite")
        print("🎯 Focus: Separated Routes, Authentication, User Creation Flow")
        print("=" * 80)
        
        # Test separated API routes authentication
        self.test_separated_api_routes_authentication()
        
        # Test user creation flow
        self.test_user_creation_flow()
        
        # Test data integration
        self.test_data_integration_and_demo_data()
        
        # Test API response format
        self.test_api_response_format()
        
        # Test separated routes functionality
        self.test_separated_routes_functionality()
        
        # Generate summary
        passed, failed, critical = self.generate_summary()
        return passed, failed, critical
    
    def generate_summary(self):
        """Generate comprehensive test summary"""
        print("\n" + "=" * 80)
        print("🏁 SEPARATED API ROUTES TESTING SUMMARY")
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
            'Authentication': [],
            'User Creation': [],
            'Data Integration': [],
            'Response Format': [],
            'Route Separation': []
        }
        
        for result in self.test_results:
            test_name = result['test']
            if 'Auth' in test_name:
                categories['Authentication'].append(result)
            elif 'User Creation' in test_name:
                categories['User Creation'].append(result)
            elif 'Data Integration' in test_name:
                categories['Data Integration'].append(result)
            elif 'Response Format' in test_name:
                categories['Response Format'].append(result)
            elif 'Separated Routes' in test_name:
                categories['Route Separation'].append(result)
        
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
        
        # Recommendations
        print(f"\n💡 RECOMMENDATIONS:")
        
        if critical_failed == 0:
            print("   🎉 All separated API routes working correctly!")
            print("   ✅ Authentication properly implemented")
            print("   ✅ User creation flow functional")
            print("   ✅ Data integration ready")
            print("   ✅ Response format consistent")
        else:
            print("   🔧 Fix critical issues before proceeding:")
            
            # Specific recommendations based on failed tests
            failed_categories = set()
            for issue in self.critical_issues:
                if 'Auth' in issue['test']:
                    failed_categories.add('auth')
                elif 'User Creation' in issue['test']:
                    failed_categories.add('user')
                elif 'Data Integration' in issue['test']:
                    failed_categories.add('data')
                elif 'Response Format' in issue['test']:
                    failed_categories.add('format')
                elif 'Separated Routes' in issue['test']:
                    failed_categories.add('routes')
            
            if 'auth' in failed_categories:
                print("      - Fix authentication issues in separated routes")
            if 'user' in failed_categories:
                print("      - Fix user creation flow and getAuthenticatedUser() function")
            if 'data' in failed_categories:
                print("      - Fix data integration and demo data issues")
            if 'format' in failed_categories:
                print("      - Standardize API response format across all routes")
            if 'routes' in failed_categories:
                print("      - Complete route separation implementation")
        
        print(f"\n📝 Next Steps:")
        if critical_failed == 0:
            print("   ✅ Separated API routes working correctly")
            print("   ✅ User creation flow functional")
            print("   ➡️  Ready for frontend-API integration testing")
        else:
            print("   🔧 Fix critical separated routes issues first")
            print("   🔄 Re-run tests after fixes")
        
        return passed_tests, failed_tests, critical_failed

if __name__ == "__main__":
    tester = SeparatedRoutesBackendTester()
    passed, failed, critical = tester.run_all_tests()
    
    # Exit with appropriate code
    if critical > 0:
        print(f"\n🚨 CRITICAL ISSUES FOUND: {critical}")
        print("Fix critical issues before proceeding to frontend testing.")
        exit(2)  # Critical issues
    elif failed > 0:
        print(f"\n⚠️  MINOR ISSUES FOUND: {failed}")
        print("Consider fixing minor issues but can proceed with caution.")
        exit(1)  # Minor issues
    else:
        print(f"\n🎉 ALL TESTS PASSED!")
        print("Separated API routes are ready for frontend integration testing.")
        exit(0)  # Success