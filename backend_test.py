#!/usr/bin/env python3
"""
Stockify Backend API Testing Suite
Tests all CRUD operations, authentication, and business logic
"""

import requests
import sys
import json
from datetime import datetime, timedelta
import os
from pathlib import Path

class StockifyAPITester:
    def __init__(self):
        # Get the backend URL from frontend .env file
        frontend_env_path = Path("/app/frontend/.env")
        if frontend_env_path.exists():
            with open(frontend_env_path, 'r') as f:
                for line in f:
                    if line.startswith('REACT_APP_BACKEND_URL='):
                        self.base_url = line.split('=', 1)[1].strip()
                        break
        else:
            self.base_url = "http://localhost:8001"
        
        self.api_url = f"{self.base_url}/api"
        self.admin_token = None
        self.user_token = None
        self.test_article_id = None
        self.test_demande_id = None
        self.tests_run = 0
        self.tests_passed = 0
        
        print(f"🔧 Testing Stockify API at: {self.api_url}")

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        return success

    def make_request(self, method, endpoint, data=None, files=None, token=None, expected_status=200):
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}/{endpoint}"
        headers = {}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        if data and not files:
            headers['Content-Type'] = 'application/json'
            data = json.dumps(data) if isinstance(data, dict) else data

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, headers={k:v for k,v in headers.items() if k != 'Content-Type'})
                else:
                    response = requests.post(url, data=data, headers=headers)
            elif method == 'PUT':
                if files:
                    response = requests.put(url, data=data, files=files, headers={k:v for k,v in headers.items() if k != 'Content-Type'})
                else:
                    response = requests.put(url, data=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            else:
                return False, f"Unsupported method: {method}"

            success = response.status_code == expected_status
            if success:
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                return False, f"Status {response.status_code}: {response.text}"
                
        except Exception as e:
            return False, f"Request failed: {str(e)}"

    def test_health_check(self):
        """Test if the API is accessible"""
        try:
            response = requests.get(f"{self.base_url}/docs", timeout=5)
            return self.log_test("API Health Check", response.status_code == 200)
        except Exception as e:
            return self.log_test("API Health Check", False, str(e))

    def test_admin_login(self):
        """Test admin login"""
        success, result = self.make_request('POST', 'auth/login', {
            'email': 'admin@stockify.com',
            'password': 'admin123'
        })
        
        if success and 'access_token' in result:
            self.admin_token = result['access_token']
            return self.log_test("Admin Login", True)
        else:
            return self.log_test("Admin Login", False, str(result))

    def test_user_login(self):
        """Test user login"""
        success, result = self.make_request('POST', 'auth/login', {
            'email': 'user@stockify.com',
            'password': 'user123'
        })
        
        if success and 'access_token' in result:
            self.user_token = result['access_token']
            return self.log_test("User Login", True)
        else:
            return self.log_test("User Login", False, str(result))

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        success, result = self.make_request('POST', 'auth/login', {
            'email': 'invalid@test.com',
            'password': 'wrongpassword'
        }, expected_status=401)
        
        return self.log_test("Invalid Login (should fail)", success)

    def test_get_current_user(self):
        """Test getting current user info"""
        if not self.admin_token:
            return self.log_test("Get Current User", False, "No admin token")
        
        success, result = self.make_request('GET', 'auth/me', token=self.admin_token)
        
        if success and 'email' in result:
            return self.log_test("Get Current User", True)
        else:
            return self.log_test("Get Current User", False, str(result))

    def test_create_article(self):
        """Test creating a new article (admin only)"""
        if not self.admin_token:
            return self.log_test("Create Article", False, "No admin token")
        
        # Test with form data (as the API expects)
        article_data = {
            'nom': 'Test Article',
            'description': 'Test Description',
            'quantite': '100',
            'quantite_min': '10',
            'date_expiration': (datetime.now() + timedelta(days=30)).isoformat()
        }
        
        success, result = self.make_request('POST', 'articles', data=article_data, token=self.admin_token, expected_status=200)
        
        if success and 'id' in result:
            self.test_article_id = result['id']
            return self.log_test("Create Article", True)
        else:
            return self.log_test("Create Article", False, str(result))

    def test_get_articles(self):
        """Test getting all articles"""
        if not self.admin_token:
            return self.log_test("Get Articles", False, "No admin token")
        
        success, result = self.make_request('GET', 'articles', token=self.admin_token)
        
        if success and isinstance(result, list):
            return self.log_test("Get Articles", True)
        else:
            return self.log_test("Get Articles", False, str(result))

    def test_get_single_article(self):
        """Test getting a single article"""
        if not self.admin_token or not self.test_article_id:
            return self.log_test("Get Single Article", False, "Missing token or article ID")
        
        success, result = self.make_request('GET', f'articles/{self.test_article_id}', token=self.admin_token)
        
        if success and 'id' in result:
            return self.log_test("Get Single Article", True)
        else:
            return self.log_test("Get Single Article", False, str(result))

    def test_update_article(self):
        """Test updating an article"""
        if not self.admin_token or not self.test_article_id:
            return self.log_test("Update Article", False, "Missing token or article ID")
        
        update_data = {
            'nom': 'Updated Test Article',
            'description': 'Updated Description',
            'quantite': '150',
            'quantite_min': '15'
        }
        
        success, result = self.make_request('PUT', f'articles/{self.test_article_id}', data=update_data, token=self.admin_token)
        
        if success and 'nom' in result and result['nom'] == 'Updated Test Article':
            return self.log_test("Update Article", True)
        else:
            return self.log_test("Update Article", False, str(result))

    def test_create_demande(self):
        """Test creating a request (user)"""
        if not self.user_token or not self.test_article_id:
            return self.log_test("Create Demande", False, "Missing user token or article ID")
        
        demande_data = {
            'article_id': self.test_article_id,
            'quantite_demandee': 5
        }
        
        success, result = self.make_request('POST', 'demandes', data=demande_data, token=self.user_token)
        
        if success and 'id' in result:
            self.test_demande_id = result['id']
            return self.log_test("Create Demande", True)
        else:
            return self.log_test("Create Demande", False, str(result))

    def test_get_demandes(self):
        """Test getting requests"""
        if not self.admin_token:
            return self.log_test("Get Demandes", False, "No admin token")
        
        success, result = self.make_request('GET', 'demandes', token=self.admin_token)
        
        if success and isinstance(result, list):
            return self.log_test("Get Demandes", True)
        else:
            return self.log_test("Get Demandes", False, str(result))

    def test_approve_demande(self):
        """Test approving a request (admin)"""
        if not self.admin_token or not self.test_demande_id:
            return self.log_test("Approve Demande", False, "Missing admin token or demande ID")
        
        success, result = self.make_request('PUT', f'demandes/{self.test_demande_id}/approve', token=self.admin_token)
        
        if success:
            return self.log_test("Approve Demande", True)
        else:
            return self.log_test("Approve Demande", False, str(result))

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        if not self.admin_token:
            return self.log_test("Dashboard Stats", False, "No admin token")
        
        success, result = self.make_request('GET', 'dashboard/stats', token=self.admin_token)
        
        if success and 'total_articles' in result:
            return self.log_test("Dashboard Stats", True)
        else:
            return self.log_test("Dashboard Stats", False, str(result))

    def test_dashboard_alerts(self):
        """Test dashboard alerts"""
        if not self.admin_token:
            return self.log_test("Dashboard Alerts", False, "No admin token")
        
        success, result = self.make_request('GET', 'dashboard/alerts', token=self.admin_token)
        
        if success and isinstance(result, list):
            return self.log_test("Dashboard Alerts", True)
        else:
            return self.log_test("Dashboard Alerts", False, str(result))

    def test_unauthorized_access(self):
        """Test accessing admin endpoints without proper token"""
        success, result = self.make_request('POST', 'articles', data={'nom': 'test'}, expected_status=401)
        return self.log_test("Unauthorized Access (should fail)", success)

    def test_user_cannot_create_article(self):
        """Test that regular users cannot create articles"""
        if not self.user_token:
            return self.log_test("User Cannot Create Article", False, "No user token")
        
        article_data = {
            'nom': 'Unauthorized Article',
            'description': 'Should not work',
            'quantite': '10',
            'quantite_min': '1'
        }
        
        success, result = self.make_request('POST', 'articles', data=article_data, token=self.user_token, expected_status=403)
        return self.log_test("User Cannot Create Article (should fail)", success)

    def test_delete_article(self):
        """Test deleting an article (cleanup)"""
        if not self.admin_token or not self.test_article_id:
            return self.log_test("Delete Article", False, "Missing token or article ID")
        
        success, result = self.make_request('DELETE', f'articles/{self.test_article_id}', token=self.admin_token)
        
        if success:
            return self.log_test("Delete Article", True)
        else:
            return self.log_test("Delete Article", False, str(result))

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Stockify API Tests\n")
        
        # Basic connectivity
        self.test_health_check()
        
        # Authentication tests
        self.test_admin_login()
        self.test_user_login()
        self.test_invalid_login()
        self.test_get_current_user()
        
        # Authorization tests
        self.test_unauthorized_access()
        self.test_user_cannot_create_article()
        
        # Article CRUD tests
        self.test_create_article()
        self.test_get_articles()
        self.test_get_single_article()
        self.test_update_article()
        
        # Request workflow tests
        self.test_create_demande()
        self.test_get_demandes()
        self.test_approve_demande()
        
        # Dashboard tests
        self.test_dashboard_stats()
        self.test_dashboard_alerts()
        
        # Cleanup
        self.test_delete_article()
        
        # Print results
        print(f"\n📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"❌ {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    tester = StockifyAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())