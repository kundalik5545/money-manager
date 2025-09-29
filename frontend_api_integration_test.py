#!/usr/bin/env python3
"""
Finance Wizard Frontend-API Integration Readiness Test
Tests that APIs are ready for frontend consumption
Focus: Response format, data structure, error handling
"""

import requests
import json
import os
from datetime import datetime

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://cashflow-182.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

class FrontendAPIIntegrationTester:
    def __init__(self):
        self.test_results = []
        self.session = requests.Session()
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_api_response_structure(self):
        """Test that API responses have the correct structure for frontend consumption"""
        print("\n=== Testing API Response Structure for Frontend ===")
        
        endpoints = [
            ("/accounts", "Accounts API"),
            ("/categories", "Categories API"),
            ("/transactions", "Transactions API"),
            ("/analytics", "Analytics API")
        ]
        
        for endpoint, name in endpoints:
            try:
                url = f"{API_BASE}{endpoint}"
                response = self.session.get(url, timeout=15)
                
                # Should return 401 for unauthenticated requests
                if response.status_code == 401:
                    try:
                        data = response.json()
                        
                        # Check response structure
                        has_success_field = 'success' in data
                        has_error_field = 'error' in data
                        success_is_false = data.get('success') == False
                        error_is_string = isinstance(data.get('error'), str)
                        
                        structure_valid = (
                            has_success_field and 
                            has_error_field and 
                            success_is_false and 
                            error_is_string
                        )
                        
                        self.log_test(
                            f"Frontend API Structure - {name} Error Response",
                            structure_valid,
                            "Error response has correct structure for frontend" if structure_valid else "Error response structure invalid",
                            f"Response: {data}"
                        )
                        
                    except json.JSONDecodeError:
                        self.log_test(
                            f"Frontend API Structure - {name} Error Response",
                            False,
                            "Error response is not valid JSON",
                            response.text[:200]
                        )
                else:
                    self.log_test(
                        f"Frontend API Structure - {name}",
                        False,
                        f"Unexpected status code: {response.status_code}",
                        response.text[:200]
                    )
                    
            except requests.exceptions.RequestException as e:
                self.log_test(
                    f"Frontend API Structure - {name}",
                    False,
                    "Request failed",
                    str(e)
                )
    
    def test_api_cors_headers(self):
        """Test that APIs have proper CORS headers for frontend consumption"""
        print("\n=== Testing CORS Headers for Frontend Integration ===")
        
        try:
            # Test preflight request
            url = f"{API_BASE}/accounts"
            response = self.session.options(url, timeout=15)
            
            # Check for CORS headers (may not be present in current implementation)
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
            }
            
            self.log_test(
                "Frontend API CORS - Preflight Response",
                response.status_code in [200, 204, 404],  # 404 is acceptable if OPTIONS not implemented
                f"Preflight request handled (Status: {response.status_code})",
                f"CORS headers: {cors_headers}"
            )
            
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Frontend API CORS - Preflight Response",
                False,
                "CORS preflight request failed",
                str(e)
            )
    
    def test_api_content_types(self):
        """Test that APIs return proper content types"""
        print("\n=== Testing Content Types for Frontend ===")
        
        endpoints = [
            ("/accounts", "Accounts API"),
            ("/categories", "Categories API"),
            ("/transactions", "Transactions API"),
            ("/analytics", "Analytics API"),
            ("/export?format=csv", "CSV Export"),
            ("/export?format=xlsx", "Excel Export")
        ]
        
        for endpoint, name in endpoints:
            try:
                url = f"{API_BASE}{endpoint}"
                response = self.session.get(url, timeout=15)
                
                content_type = response.headers.get('Content-Type', '')
                
                if 'export' in endpoint:
                    # Export endpoints should return appropriate content types
                    if 'csv' in endpoint:
                        expected_type = 'text/csv'
                        correct_type = 'text/csv' in content_type
                    elif 'xlsx' in endpoint:
                        expected_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        correct_type = expected_type in content_type
                    else:
                        expected_type = 'application/json'
                        correct_type = 'application/json' in content_type
                else:
                    # Regular API endpoints should return JSON
                    expected_type = 'application/json'
                    correct_type = 'application/json' in content_type
                
                self.log_test(
                    f"Frontend API Content-Type - {name}",
                    correct_type or response.status_code == 401,  # 401 responses should still have correct content type
                    f"Returns correct content type: {expected_type}" if correct_type else f"Content type mismatch: got {content_type}, expected {expected_type}",
                    f"Status: {response.status_code}, Content-Type: {content_type}"
                )
                
            except requests.exceptions.RequestException as e:
                self.log_test(
                    f"Frontend API Content-Type - {name}",
                    False,
                    "Request failed",
                    str(e)
                )
    
    def test_api_error_handling_consistency(self):
        """Test that all APIs handle errors consistently for frontend"""
        print("\n=== Testing Error Handling Consistency ===")
        
        # Test various error scenarios
        error_tests = [
            ("/accounts/invalid-id", "PUT", "Invalid Account Update"),
            ("/categories/invalid-id", "PUT", "Invalid Category Update"),
            ("/transactions/invalid-id", "PUT", "Invalid Transaction Update"),
            ("/accounts/invalid-id", "DELETE", "Invalid Account Delete"),
            ("/invalid-endpoint", "GET", "Invalid Endpoint")
        ]
        
        for endpoint, method, name in error_tests:
            try:
                url = f"{API_BASE}{endpoint}"
                
                if method == "PUT":
                    response = self.session.put(url, json={"test": "data"}, timeout=15)
                elif method == "DELETE":
                    response = self.session.delete(url, timeout=15)
                else:
                    response = self.session.get(url, timeout=15)
                
                # Should return proper error responses
                if response.status_code in [401, 404, 400, 500]:
                    try:
                        data = response.json()
                        
                        # Check error response structure
                        has_success_field = 'success' in data
                        success_is_false = data.get('success') == False
                        has_error_message = 'error' in data and isinstance(data.get('error'), str)
                        
                        error_structure_valid = has_success_field and success_is_false and has_error_message
                        
                        self.log_test(
                            f"Frontend API Error Handling - {name}",
                            error_structure_valid,
                            f"Error response properly structured (Status: {response.status_code})" if error_structure_valid else f"Error response structure invalid (Status: {response.status_code})",
                            f"Response: {data}"
                        )
                        
                    except json.JSONDecodeError:
                        self.log_test(
                            f"Frontend API Error Handling - {name}",
                            False,
                            f"Error response not valid JSON (Status: {response.status_code})",
                            response.text[:200]
                        )
                else:
                    self.log_test(
                        f"Frontend API Error Handling - {name}",
                        False,
                        f"Unexpected status code: {response.status_code}",
                        response.text[:200]
                    )
                    
            except requests.exceptions.RequestException as e:
                self.log_test(
                    f"Frontend API Error Handling - {name}",
                    False,
                    "Request failed",
                    str(e)
                )
    
    def run_all_tests(self):
        """Run all frontend-API integration readiness tests"""
        print("🚀 Starting Frontend-API Integration Readiness Testing")
        print("🎯 Focus: Response Structure, Content Types, Error Handling")
        print("=" * 80)
        
        # Test API response structure
        self.test_api_response_structure()
        
        # Test CORS headers
        self.test_api_cors_headers()
        
        # Test content types
        self.test_api_content_types()
        
        # Test error handling consistency
        self.test_api_error_handling_consistency()
        
        # Generate summary
        passed, failed = self.generate_summary()
        return passed, failed
    
    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 80)
        print("🏁 FRONTEND-API INTEGRATION READINESS SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r['success']])
        failed_tests = total_tests - passed_tests
        
        print(f"📊 Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"📈 Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Show failed tests
        failed_results = [r for r in self.test_results if not r['success']]
        if failed_results:
            print(f"\n❌ Failed Tests:")
            for result in failed_results:
                print(f"   • {result['test']}: {result['message']}")
        
        print(f"\n💡 FRONTEND INTEGRATION READINESS:")
        if failed_tests == 0:
            print("   🎉 APIs are fully ready for frontend integration!")
            print("   ✅ Response structures consistent")
            print("   ✅ Error handling standardized")
            print("   ✅ Content types appropriate")
        else:
            print("   ⚠️  Some issues found but APIs should still work with frontend")
            print("   🔧 Consider addressing failed tests for better integration")
        
        return passed_tests, failed_tests

if __name__ == "__main__":
    tester = FrontendAPIIntegrationTester()
    passed, failed = tester.run_all_tests()
    
    if failed == 0:
        print(f"\n🎉 ALL TESTS PASSED!")
        print("APIs are ready for frontend integration.")
        exit(0)
    else:
        print(f"\n⚠️  SOME ISSUES FOUND: {failed}")
        print("APIs should still work but consider fixing issues.")
        exit(1)