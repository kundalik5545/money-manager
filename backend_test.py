#!/usr/bin/env python3
"""
Finance Wizard Backend Testing Suite - Phase 3
Tests Clerk Authentication, Neon PostgreSQL Database, and API endpoints
Focus: Authentication integration, database connectivity, and user context
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

class Phase3BackendTester:
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
    
    def test_environment_configuration(self):
        """Test that all required environment variables are configured"""
        print("\n=== Testing Environment Configuration ===")
        
        required_vars = [
            ('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', '.env.local', True),
            ('CLERK_SECRET_KEY', '.env.local', True),
            ('DATABASE_URL', '.env.local', True),
            ('DIRECT_URL', '.env.local', True),
            ('RESEND_API_KEY', '.env.local', False)
        ]
        
        for var_name, file_name, is_critical in required_vars:
            try:
                with open(f'/app/{file_name}', 'r') as f:
                    content = f.read()
                
                # Check if variable exists and has a value
                if f'{var_name}=' in content:
                    var_line = [line for line in content.split('\n') if line.startswith(f'{var_name}=')][0]
                    var_value = var_line.split('=', 1)[1].strip().strip('"\'')
                    
                    if var_value and var_value != 'your_key_here':
                        self.log_test(
                            f"Environment Config - {var_name}",
                            True,
                            f"Environment variable configured in {file_name}",
                            f"Value length: {len(var_value)} characters",
                            critical=is_critical
                        )
                    else:
                        self.log_test(
                            f"Environment Config - {var_name}",
                            False,
                            f"Environment variable empty or placeholder in {file_name}",
                            f"Current value: '{var_value}'",
                            critical=is_critical
                        )
                else:
                    self.log_test(
                        f"Environment Config - {var_name}",
                        False,
                        f"Environment variable missing from {file_name}",
                        "Variable not found in file",
                        critical=is_critical
                    )
                    
            except Exception as e:
                self.log_test(
                    f"Environment Config - {var_name}",
                    False,
                    f"Failed to check {file_name}",
                    str(e),
                    critical=is_critical
                )
    
    def test_database_connection(self):
        """Test Neon PostgreSQL database connection via Prisma"""
        print("\n=== Testing Neon PostgreSQL Database Connection ===")
        
        try:
            # Test database connection by running prisma db push
            result = subprocess.run(
                ["npx", "prisma", "db", "push", "--accept-data-loss"],
                cwd="/app",
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode == 0:
                self.log_test(
                    "Database Connection - Prisma Push",
                    True,
                    "Successfully connected to Neon PostgreSQL and synced schema",
                    f"Output: {result.stdout.strip()}",
                    critical=True
                )
                
                # Test prisma client connection
                client_test = subprocess.run(
                    ["node", "-e", "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$connect().then(() => { console.log('Connected'); prisma.$disconnect(); }).catch(e => { console.error('Error:', e.message); process.exit(1); })"],
                    cwd="/app",
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                
                if client_test.returncode == 0:
                    self.log_test(
                        "Database Connection - Prisma Client",
                        True,
                        "Prisma client successfully connected to database",
                        f"Output: {client_test.stdout.strip()}",
                        critical=True
                    )
                else:
                    self.log_test(
                        "Database Connection - Prisma Client",
                        False,
                        "Prisma client failed to connect",
                        f"Error: {client_test.stderr.strip()}",
                        critical=True
                    )
            else:
                self.log_test(
                    "Database Connection - Prisma Push",
                    False,
                    "Failed to connect to Neon PostgreSQL or sync schema",
                    f"Error: {result.stderr.strip()}",
                    critical=True
                )
                
        except subprocess.TimeoutExpired:
            self.log_test(
                "Database Connection",
                False,
                "Database connection test timed out",
                "Connection attempt exceeded timeout",
                critical=True
            )
        except Exception as e:
            self.log_test(
                "Database Connection",
                False,
                "Database connection test failed",
                str(e),
                critical=True
            )
    
    def test_database_seeding(self):
        """Test database seeding with demo data"""
        print("\n=== Testing Database Migration and Seeding ===")
        
        try:
            # Run the seed script
            result = subprocess.run(
                ["node", "prisma/seed.js"],
                cwd="/app",
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode == 0:
                self.log_test(
                    "Database Seeding",
                    True,
                    "Database seeded successfully with demo data",
                    f"Output: {result.stdout.strip()}",
                    critical=True
                )
                
                # Verify seeded data exists
                verify_result = subprocess.run(
                    ["node", "-e", """
                    const { PrismaClient } = require('@prisma/client');
                    const prisma = new PrismaClient();
                    
                    async function verify() {
                        try {
                            const users = await prisma.user.count();
                            const accounts = await prisma.account.count();
                            const categories = await prisma.category.count();
                            const transactions = await prisma.transaction.count();
                            
                            console.log(JSON.stringify({
                                users, accounts, categories, transactions
                            }));
                            
                            await prisma.$disconnect();
                        } catch (e) {
                            console.error('Error:', e.message);
                            process.exit(1);
                        }
                    }
                    
                    verify();
                    """],
                    cwd="/app",
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                
                if verify_result.returncode == 0:
                    try:
                        counts = json.loads(verify_result.stdout.strip())
                        self.log_test(
                            "Database Seeding - Data Verification",
                            True,
                            f"Verified seeded data: {counts['users']} users, {counts['accounts']} accounts, {counts['categories']} categories, {counts['transactions']} transactions",
                            counts,
                            critical=True
                        )
                    except json.JSONDecodeError:
                        self.log_test(
                            "Database Seeding - Data Verification",
                            False,
                            "Could not parse verification output",
                            verify_result.stdout,
                            critical=True
                        )
                else:
                    self.log_test(
                        "Database Seeding - Data Verification",
                        False,
                        "Failed to verify seeded data",
                        verify_result.stderr.strip(),
                        critical=True
                    )
                    
            else:
                self.log_test(
                    "Database Seeding",
                    False,
                    "Database seeding failed",
                    f"Error: {result.stderr.strip()}",
                    critical=True
                )
                
        except subprocess.TimeoutExpired:
            self.log_test(
                "Database Seeding",
                False,
                "Database seeding timed out",
                "Seeding process exceeded timeout",
                critical=True
            )
        except Exception as e:
            self.log_test(
                "Database Seeding",
                False,
                "Database seeding failed",
                str(e),
                critical=True
            )
    
    def test_clerk_middleware(self):
        """Test Clerk middleware functionality"""
        print("\n=== Testing Clerk Authentication Middleware ===")
        
        # Test public routes (should be accessible)
        public_routes = [
            ("/", "Root page"),
            ("/sign-in", "Sign-in page"),
            ("/sign-up", "Sign-up page")
        ]
        
        for route, description in public_routes:
            try:
                url = f"{BASE_URL}{route}"
                response = self.session.get(url, timeout=15, allow_redirects=False)
                
                if response.status_code in [200, 302]:
                    self.log_test(
                        f"Clerk Middleware - Public Route {route}",
                        True,
                        f"{description} accessible (Status: {response.status_code})",
                        f"Response size: {len(response.content)} bytes",
                        critical=True
                    )
                else:
                    self.log_test(
                        f"Clerk Middleware - Public Route {route}",
                        False,
                        f"{description} not accessible (Status: {response.status_code})",
                        response.text[:200],
                        critical=True
                    )
                    
            except requests.exceptions.RequestException as e:
                self.log_test(
                    f"Clerk Middleware - Public Route {route}",
                    False,
                    f"{description} request failed",
                    str(e),
                    critical=True
                )
        
        # Test protected routes (should redirect to sign-in)
        protected_routes = [
            ("/dashboard", "Dashboard page"),
            ("/transactions", "Transactions page"),
            ("/accounts", "Accounts page")
        ]
        
        for route, description in protected_routes:
            try:
                url = f"{BASE_URL}{route}"
                response = self.session.get(url, timeout=15, allow_redirects=False)
                
                if response.status_code == 302:
                    location = response.headers.get('location', '')
                    if '/sign-in' in location:
                        self.log_test(
                            f"Clerk Middleware - Protected Route {route}",
                            True,
                            f"{description} correctly redirects to sign-in",
                            f"Redirect location: {location}",
                            critical=True
                        )
                    else:
                        self.log_test(
                            f"Clerk Middleware - Protected Route {route}",
                            False,
                            f"{description} redirects but not to sign-in",
                            f"Redirect location: {location}",
                            critical=True
                        )
                elif response.status_code == 200:
                    self.log_test(
                        f"Clerk Middleware - Protected Route {route}",
                        False,
                        f"{description} accessible without authentication (SECURITY ISSUE)",
                        "This is a critical security vulnerability",
                        critical=True
                    )
                else:
                    self.log_test(
                        f"Clerk Middleware - Protected Route {route}",
                        False,
                        f"{description} unexpected response (Status: {response.status_code})",
                        response.text[:200],
                        critical=True
                    )
                    
            except requests.exceptions.RequestException as e:
                self.log_test(
                    f"Clerk Middleware - Protected Route {route}",
                    False,
                    f"{description} request failed",
                    str(e),
                    critical=True
                )
    
    def test_api_user_context_implementation(self):
        """Test if API routes properly implement user context and authentication"""
        print("\n=== Testing API User Context Implementation ===")
        
        # Read the API route file to check for user context implementation
        try:
            with open('/app/app/api/[[...path]]/route.js', 'r') as f:
                api_content = f.read()
            
            # Check for Clerk auth imports
            has_clerk_import = '@clerk/nextjs' in api_content or 'clerk' in api_content.lower()
            has_auth_usage = 'auth()' in api_content or 'currentUser' in api_content or 'getAuth' in api_content
            has_user_filtering = 'userId' in api_content and 'where:' in api_content
            has_user_id_in_queries = api_content.count('userId') > 5  # Should appear in multiple queries
            
            self.log_test(
                "API User Context - Clerk Import",
                has_clerk_import,
                "API routes import Clerk authentication" if has_clerk_import else "API routes missing Clerk authentication import",
                f"Found clerk references: {has_clerk_import}",
                critical=True
            )
            
            self.log_test(
                "API User Context - Auth Usage",
                has_auth_usage,
                "API routes use authentication functions" if has_auth_usage else "API routes do not use authentication functions",
                f"Found auth usage: {has_auth_usage}",
                critical=True
            )
            
            self.log_test(
                "API User Context - User Filtering",
                has_user_filtering,
                "API routes implement user-specific data filtering" if has_user_filtering else "API routes missing user-specific data filtering",
                f"Found userId filtering: {has_user_filtering}",
                critical=True
            )
            
            self.log_test(
                "API User Context - Comprehensive User ID Usage",
                has_user_id_in_queries,
                "API routes consistently use userId in database queries" if has_user_id_in_queries else "API routes do not consistently filter by userId (SECURITY ISSUE)",
                f"userId appears {api_content.count('userId')} times in code",
                critical=True
            )
                
        except Exception as e:
            self.log_test(
                "API User Context - Code Analysis",
                False,
                "Failed to analyze API route implementation",
                str(e),
                critical=True
            )
    
    def test_api_endpoints_without_auth(self):
        """Test API endpoints without authentication (should require auth or return filtered data)"""
        print("\n=== Testing API Endpoints Authentication Requirements ===")
        
        endpoints = [
            ("GET", "/accounts", "Get Accounts"),
            ("GET", "/categories", "Get Categories"), 
            ("GET", "/transactions", "Get Transactions"),
            ("GET", "/analytics", "Get Analytics"),
            ("GET", "/export?format=csv", "Export CSV")
        ]
        
        for method, endpoint, name in endpoints:
            try:
                url = f"{API_BASE}{endpoint}"
                response = self.session.request(method, url, timeout=15)
                
                # Check response
                if response.status_code == 401:
                    self.log_test(
                        f"API Auth Check - {name}",
                        True,
                        "Correctly requires authentication",
                        f"Status: {response.status_code}",
                        critical=True
                    )
                elif response.status_code == 200:
                    try:
                        data = response.json()
                        if data.get('success') and data.get('data'):
                            # This could be a problem - API should require auth or return empty data for unauthenticated users
                            self.log_test(
                                f"API Auth Check - {name}",
                                False,
                                "API returns data without authentication (POTENTIAL SECURITY ISSUE)",
                                f"Status: {response.status_code}, Data returned: {len(str(data.get('data', [])))} chars",
                                critical=True
                            )
                        else:
                            self.log_test(
                                f"API Auth Check - {name}",
                                True,
                                "API accessible but returns no data without authentication",
                                f"Status: {response.status_code}, Response: {data}",
                                critical=False
                            )
                    except json.JSONDecodeError:
                        self.log_test(
                            f"API Auth Check - {name}",
                            False,
                            "API returned non-JSON response",
                            response.text[:200],
                            critical=False
                        )
                else:
                    self.log_test(
                        f"API Auth Check - {name}",
                        False,
                        f"Unexpected response status: {response.status_code}",
                        response.text[:200],
                        critical=False
                    )
                    
            except requests.exceptions.RequestException as e:
                self.log_test(
                    f"API Auth Check - {name}",
                    False,
                    "Request failed",
                    str(e),
                    critical=False
                )
    
    def test_data_integrity_and_isolation(self):
        """Test that seeded data is structured correctly and user isolation would work"""
        print("\n=== Testing Data Integrity and User Isolation ===")
        
        try:
            # Test data structure and relationships
            verify_result = subprocess.run(
                ["node", "-e", """
                const { PrismaClient } = require('@prisma/client');
                const prisma = new PrismaClient();
                
                async function testDataIntegrity() {
                    try {
                        // Get demo user
                        const demoUser = await prisma.user.findUnique({
                            where: { clerkId: 'demo_user_123' },
                            include: {
                                accounts: true,
                                categories: true,
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
                            console.error('Demo user not found');
                            process.exit(1);
                        }
                        
                        // Check data relationships
                        const results = {
                            user_id: demoUser.id,
                            accounts_count: demoUser.accounts.length,
                            categories_count: demoUser.categories.length,
                            transactions_count: demoUser.transactions.length,
                            transactions_with_accounts: demoUser.transactions.filter(t => t.account).length,
                            transactions_with_categories: demoUser.transactions.filter(t => t.category).length,
                            account_types: [...new Set(demoUser.accounts.map(a => a.type))],
                            category_types: [...new Set(demoUser.categories.map(c => c.type))],
                            total_balance: demoUser.accounts.reduce((sum, acc) => sum + acc.balance, 0)
                        };
                        
                        console.log(JSON.stringify(results));
                        await prisma.$disconnect();
                    } catch (e) {
                        console.error('Error:', e.message);
                        process.exit(1);
                    }
                }
                
                testDataIntegrity();
                """],
                cwd="/app",
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if verify_result.returncode == 0:
                try:
                    data = json.loads(verify_result.stdout.strip())
                    
                    # Validate data integrity
                    integrity_checks = [
                        (data['accounts_count'] > 0, "Demo user has accounts"),
                        (data['categories_count'] > 0, "Demo user has categories"),
                        (data['transactions_count'] > 0, "Demo user has transactions"),
                        (data['transactions_with_accounts'] == data['transactions_count'], "All transactions linked to accounts"),
                        (data['transactions_with_categories'] == data['transactions_count'], "All transactions linked to categories"),
                        ('BANK' in data['account_types'], "Bank account type exists"),
                        ('INCOME' in data['category_types'] and 'EXPENSE' in data['category_types'], "Both income and expense categories exist")
                    ]
                    
                    all_checks_passed = True
                    for check_passed, description in integrity_checks:
                        if check_passed:
                            self.log_test(
                                f"Data Integrity - {description}",
                                True,
                                description,
                                None,
                                critical=True
                            )
                        else:
                            self.log_test(
                                f"Data Integrity - {description}",
                                False,
                                f"Failed: {description}",
                                data,
                                critical=True
                            )
                            all_checks_passed = False
                    
                    if all_checks_passed:
                        self.log_test(
                            "Data Integrity - Overall",
                            True,
                            f"All data integrity checks passed. Demo user has {data['transactions_count']} transactions across {data['accounts_count']} accounts",
                            data,
                            critical=True
                        )
                    
                except json.JSONDecodeError:
                    self.log_test(
                        "Data Integrity",
                        False,
                        "Could not parse data integrity verification output",
                        verify_result.stdout,
                        critical=True
                    )
            else:
                self.log_test(
                    "Data Integrity",
                    False,
                    "Failed to verify data integrity",
                    verify_result.stderr.strip(),
                    critical=True
                )
                
        except Exception as e:
            self.log_test(
                "Data Integrity",
                False,
                "Data integrity test failed",
                str(e),
                critical=True
            )
    
    def run_all_tests(self):
        """Run all Phase 3 backend tests"""
        print("🚀 Starting Finance Wizard Backend Testing Suite - Phase 3")
        print("🎯 Focus: Clerk Authentication, Neon PostgreSQL, User Context")
        print("=" * 80)
        
        # Test environment configuration first
        self.test_environment_configuration()
        
        # Test database connection and setup
        self.test_database_connection()
        self.test_database_seeding()
        
        # Test authentication and middleware
        self.test_clerk_middleware()
        
        # Test API implementation
        self.test_api_user_context_implementation()
        self.test_api_endpoints_without_auth()
        
        # Test data integrity
        self.test_data_integrity_and_isolation()
        
        # Generate summary
        self.generate_summary()
    
    def generate_summary(self):
        """Generate comprehensive test summary"""
        print("\n" + "=" * 80)
        print("🏁 PHASE 3 BACKEND TESTING SUMMARY")
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
            'Environment': [],
            'Database': [],
            'Authentication': [],
            'API': [],
            'Data Integrity': []
        }
        
        for result in self.test_results:
            test_name = result['test']
            if 'Environment' in test_name:
                categories['Environment'].append(result)
            elif 'Database' in test_name:
                categories['Database'].append(result)
            elif 'Clerk' in test_name or 'Auth' in test_name:
                categories['Authentication'].append(result)
            elif 'API' in test_name:
                categories['API'].append(result)
            elif 'Data' in test_name:
                categories['Data Integrity'].append(result)
        
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
            print("   🎉 No critical issues found! Phase 3 backend is ready.")
        else:
            print("   🔧 Fix critical issues before proceeding:")
            
            # Specific recommendations based on failed tests
            failed_categories = set()
            for issue in self.critical_issues:
                if 'Environment' in issue['test']:
                    failed_categories.add('env')
                elif 'Database' in issue['test']:
                    failed_categories.add('db')
                elif 'Clerk' in issue['test'] or 'Auth' in issue['test']:
                    failed_categories.add('auth')
                elif 'API' in issue['test']:
                    failed_categories.add('api')
            
            if 'env' in failed_categories:
                print("      - Verify all API keys are correctly configured in .env.local")
            if 'db' in failed_categories:
                print("      - Check Neon PostgreSQL connection and run migrations")
            if 'auth' in failed_categories:
                print("      - Verify Clerk middleware configuration and API keys")
            if 'api' in failed_categories:
                print("      - Update API routes to include user authentication and filtering")
        
        print(f"\n📝 Next Steps:")
        if critical_failed == 0:
            print("   ✅ Backend authentication and database integration working")
            print("   ➡️  Ready to test frontend integration")
        else:
            print("   🔧 Fix critical backend issues first")
            print("   🔄 Re-run tests after fixes")
        
        return passed_tests, failed_tests, critical_failed

if __name__ == "__main__":
    tester = FinanceAPITester()
    passed, failed = tester.run_all_tests()
    
    # Exit with appropriate code
    exit(0 if failed == 0 else 1)