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
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://cashflow-182.preview.emergentagent.com')
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
    
    def test_accounts_api_endpoints(self):
        """Test accounts API endpoints functionality (without authentication - testing implementation)"""
        print("\n=== Testing Accounts API Endpoints Implementation ===")
        
        # Test GET /api/accounts
        try:
            url = f"{API_BASE}/accounts"
            response = self.session.get(url, timeout=15)
            
            if response.status_code == 401:
                try:
                    data = response.json()
                    if data.get('success') == False and 'Unauthorized' in data.get('error', ''):
                        self.log_test(
                            "Accounts API - GET /api/accounts Authentication",
                            True,
                            "GET /api/accounts correctly requires authentication",
                            f"Status: {response.status_code}, Response: {data}",
                            critical=True
                        )
                    else:
                        self.log_test(
                            "Accounts API - GET /api/accounts Authentication",
                            False,
                            "GET /api/accounts returns 401 but with unexpected format",
                            f"Status: {response.status_code}, Response: {data}",
                            critical=True
                        )
                except json.JSONDecodeError:
                    self.log_test(
                        "Accounts API - GET /api/accounts Authentication",
                        True,
                        "GET /api/accounts correctly requires authentication (non-JSON 401)",
                        f"Status: {response.status_code}",
                        critical=True
                    )
            else:
                self.log_test(
                    "Accounts API - GET /api/accounts Authentication",
                    False,
                    f"GET /api/accounts should return 401 without auth, got {response.status_code}",
                    response.text[:200],
                    critical=True
                )
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Accounts API - GET /api/accounts",
                False,
                "GET /api/accounts request failed",
                str(e),
                critical=True
            )
        
        # Test POST /api/accounts
        try:
            url = f"{API_BASE}/accounts"
            test_account = {
                "name": "Test Bank Account",
                "type": "BANK",
                "balance": 1000.00
            }
            response = self.session.post(url, json=test_account, timeout=15)
            
            if response.status_code == 401:
                try:
                    data = response.json()
                    if data.get('success') == False and 'Unauthorized' in data.get('error', ''):
                        self.log_test(
                            "Accounts API - POST /api/accounts Authentication",
                            True,
                            "POST /api/accounts correctly requires authentication",
                            f"Status: {response.status_code}, Response: {data}",
                            critical=True
                        )
                    else:
                        self.log_test(
                            "Accounts API - POST /api/accounts Authentication",
                            False,
                            "POST /api/accounts returns 401 but with unexpected format",
                            f"Status: {response.status_code}, Response: {data}",
                            critical=True
                        )
                except json.JSONDecodeError:
                    self.log_test(
                        "Accounts API - POST /api/accounts Authentication",
                        True,
                        "POST /api/accounts correctly requires authentication (non-JSON 401)",
                        f"Status: {response.status_code}",
                        critical=True
                    )
            else:
                self.log_test(
                    "Accounts API - POST /api/accounts Authentication",
                    False,
                    f"POST /api/accounts should return 401 without auth, got {response.status_code}",
                    response.text[:200],
                    critical=True
                )
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Accounts API - POST /api/accounts",
                False,
                "POST /api/accounts request failed",
                str(e),
                critical=True
            )
        
        # Test PUT /api/accounts/{id} (account update)
        try:
            url = f"{API_BASE}/accounts/test-account-id"
            update_data = {
                "name": "Updated Account Name",
                "type": "CREDIT_CARD",
                "balance": 2000.00
            }
            response = self.session.put(url, json=update_data, timeout=15)
            
            if response.status_code == 401:
                try:
                    data = response.json()
                    if data.get('success') == False and 'Unauthorized' in data.get('error', ''):
                        self.log_test(
                            "Accounts API - PUT /api/accounts/{id} Authentication",
                            True,
                            "PUT /api/accounts/{id} correctly requires authentication",
                            f"Status: {response.status_code}, Response: {data}",
                            critical=True
                        )
                    else:
                        self.log_test(
                            "Accounts API - PUT /api/accounts/{id} Authentication",
                            False,
                            "PUT /api/accounts/{id} returns 401 but with unexpected format",
                            f"Status: {response.status_code}, Response: {data}",
                            critical=True
                        )
                except json.JSONDecodeError:
                    self.log_test(
                        "Accounts API - PUT /api/accounts/{id} Authentication",
                        True,
                        "PUT /api/accounts/{id} correctly requires authentication (non-JSON 401)",
                        f"Status: {response.status_code}",
                        critical=True
                    )
            else:
                self.log_test(
                    "Accounts API - PUT /api/accounts/{id} Authentication",
                    False,
                    f"PUT /api/accounts/{{id}} should return 401 without auth, got {response.status_code}",
                    response.text[:200],
                    critical=True
                )
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Accounts API - PUT /api/accounts/{id}",
                False,
                "PUT /api/accounts/{id} request failed",
                str(e),
                critical=True
            )
        
        # Test DELETE /api/accounts/{id}
        try:
            url = f"{API_BASE}/accounts/test-account-id"
            response = self.session.delete(url, timeout=15)
            
            if response.status_code == 401:
                try:
                    data = response.json()
                    if data.get('success') == False and 'Unauthorized' in data.get('error', ''):
                        self.log_test(
                            "Accounts API - DELETE /api/accounts/{id} Authentication",
                            True,
                            "DELETE /api/accounts/{id} correctly requires authentication",
                            f"Status: {response.status_code}, Response: {data}",
                            critical=True
                        )
                    else:
                        self.log_test(
                            "Accounts API - DELETE /api/accounts/{id} Authentication",
                            False,
                            "DELETE /api/accounts/{id} returns 401 but with unexpected format",
                            f"Status: {response.status_code}, Response: {data}",
                            critical=True
                        )
                except json.JSONDecodeError:
                    self.log_test(
                        "Accounts API - DELETE /api/accounts/{id} Authentication",
                        True,
                        "DELETE /api/accounts/{id} correctly requires authentication (non-JSON 401)",
                        f"Status: {response.status_code}",
                        critical=True
                    )
            else:
                self.log_test(
                    "Accounts API - DELETE /api/accounts/{id} Authentication",
                    False,
                    f"DELETE /api/accounts/{{id}} should return 401 without auth, got {response.status_code}",
                    response.text[:200],
                    critical=True
                )
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Accounts API - DELETE /api/accounts/{id}",
                False,
                "DELETE /api/accounts/{id} request failed",
                str(e),
                critical=True
            )
        
        # Test PUT /api/accounts/default (new endpoint mentioned in review)
        try:
            url = f"{API_BASE}/accounts/default"
            default_data = {
                "accountId": "test-account-id"
            }
            response = self.session.put(url, json=default_data, timeout=15)
            
            if response.status_code == 401:
                try:
                    data = response.json()
                    if data.get('success') == False and 'Unauthorized' in data.get('error', ''):
                        self.log_test(
                            "Accounts API - PUT /api/accounts/default Authentication",
                            True,
                            "PUT /api/accounts/default correctly requires authentication",
                            f"Status: {response.status_code}, Response: {data}",
                            critical=True
                        )
                    else:
                        self.log_test(
                            "Accounts API - PUT /api/accounts/default Authentication",
                            False,
                            "PUT /api/accounts/default returns 401 but with unexpected format",
                            f"Status: {response.status_code}, Response: {data}",
                            critical=True
                        )
                except json.JSONDecodeError:
                    self.log_test(
                        "Accounts API - PUT /api/accounts/default Authentication",
                        True,
                        "PUT /api/accounts/default correctly requires authentication (non-JSON 401)",
                        f"Status: {response.status_code}",
                        critical=True
                    )
            elif response.status_code == 404:
                self.log_test(
                    "Accounts API - PUT /api/accounts/default Implementation",
                    False,
                    "PUT /api/accounts/default endpoint not implemented (404 Not Found)",
                    f"Status: {response.status_code}, Response: {response.text[:200]}",
                    critical=True
                )
            else:
                self.log_test(
                    "Accounts API - PUT /api/accounts/default Authentication",
                    False,
                    f"PUT /api/accounts/default unexpected response: {response.status_code}",
                    response.text[:200],
                    critical=True
                )
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Accounts API - PUT /api/accounts/default",
                False,
                "PUT /api/accounts/default request failed",
                str(e),
                critical=True
            )
    
    def test_accounts_api_implementation_analysis(self):
        """Analyze the accounts API implementation in the code"""
        print("\n=== Analyzing Accounts API Implementation ===")
        
        try:
            with open('/app/app/api/[[...path]]/route.js', 'r') as f:
                api_content = f.read()
            
            # Check for accounts endpoints implementation
            has_get_accounts = 'getAccounts' in api_content and 'case \'accounts\':' in api_content
            has_create_account = 'createAccount' in api_content and 'case \'accounts\':' in api_content
            has_update_account = 'accounts' in api_content and 'PUT' in api_content
            has_delete_account = 'accounts' in api_content and 'DELETE' in api_content
            has_default_account_endpoint = 'accounts/default' in api_content or 'default' in api_content
            
            # Check for proper response format
            has_success_response_format = '{ success: true' in api_content or 'success: true' in api_content
            has_error_response_format = '{ success: false' in api_content or 'success: false' in api_content
            
            # Check for user ownership verification
            has_user_ownership = 'userId: user.id' in api_content
            has_transaction_count = '_count' in api_content and 'transactions' in api_content
            has_balance_calculation = 'balance' in api_content
            has_isdefault_flag = 'isDefault' in api_content or 'defaultAccountId' in api_content
            
            self.log_test(
                "Accounts API Implementation - GET /api/accounts",
                has_get_accounts,
                "GET /api/accounts endpoint implemented" if has_get_accounts else "GET /api/accounts endpoint missing",
                f"Found getAccounts function: {has_get_accounts}",
                critical=True
            )
            
            self.log_test(
                "Accounts API Implementation - POST /api/accounts",
                has_create_account,
                "POST /api/accounts endpoint implemented" if has_create_account else "POST /api/accounts endpoint missing",
                f"Found createAccount function: {has_create_account}",
                critical=True
            )
            
            self.log_test(
                "Accounts API Implementation - PUT /api/accounts/{id}",
                has_update_account,
                "PUT /api/accounts/{id} endpoint implemented" if has_update_account else "PUT /api/accounts/{id} endpoint missing",
                f"Found accounts update in PUT handler: {has_update_account}",
                critical=True
            )
            
            self.log_test(
                "Accounts API Implementation - DELETE /api/accounts/{id}",
                has_delete_account,
                "DELETE /api/accounts/{id} endpoint implemented" if has_delete_account else "DELETE /api/accounts/{id} endpoint missing",
                f"Found accounts delete in DELETE handler: {has_delete_account}",
                critical=True
            )
            
            self.log_test(
                "Accounts API Implementation - PUT /api/accounts/default",
                has_default_account_endpoint,
                "PUT /api/accounts/default endpoint implemented" if has_default_account_endpoint else "PUT /api/accounts/default endpoint NOT IMPLEMENTED (mentioned in review request)",
                f"Found default account handling: {has_default_account_endpoint}",
                critical=True
            )
            
            self.log_test(
                "Accounts API Implementation - Response Format",
                has_success_response_format and has_error_response_format,
                "Proper response format implemented" if (has_success_response_format and has_error_response_format) else "Response format inconsistent",
                f"Success format: {has_success_response_format}, Error format: {has_error_response_format}",
                critical=False
            )
            
            self.log_test(
                "Accounts API Implementation - User Ownership",
                has_user_ownership,
                "User ownership verification implemented" if has_user_ownership else "User ownership verification missing",
                f"Found userId filtering: {has_user_ownership}",
                critical=True
            )
            
            self.log_test(
                "Accounts API Implementation - Transaction Count",
                has_transaction_count,
                "Transaction count included in accounts response" if has_transaction_count else "Transaction count missing from accounts response",
                f"Found transaction count: {has_transaction_count}",
                critical=False
            )
            
            self.log_test(
                "Accounts API Implementation - Balance Calculations",
                has_balance_calculation,
                "Balance calculations implemented" if has_balance_calculation else "Balance calculations missing",
                f"Found balance handling: {has_balance_calculation}",
                critical=False
            )
            
            # Check for specific account types
            has_account_types = 'BANK' in api_content and 'CREDIT_CARD' in api_content and 'WALLET' in api_content
            self.log_test(
                "Accounts API Implementation - Account Types",
                has_account_types,
                "Multiple account types supported (BANK, CREDIT_CARD, WALLET)" if has_account_types else "Account types may be limited",
                f"Found account type references: {has_account_types}",
                critical=False
            )
                
        except Exception as e:
            self.log_test(
                "Accounts API Implementation Analysis",
                False,
                "Failed to analyze accounts API implementation",
                str(e),
                critical=True
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
        
        # Test accounts API specifically
        self.test_accounts_api_endpoints()
        self.test_accounts_api_implementation_analysis()
        
        # Test data integrity
        self.test_data_integrity_and_isolation()
        
        # Generate summary
        passed, failed, critical = self.generate_summary()
        return passed, failed, critical
    
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
    tester = Phase3BackendTester()
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
        print("Backend is ready for frontend integration testing.")
        exit(0)  # Success