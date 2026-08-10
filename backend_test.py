#!/usr/bin/env python3
"""
Backend API Testing Script for Grant Automation Engine
Tests all REST API endpoints including new SAM.gov UEI verification and budget visualization features.
"""

import requests
import json
import sys
import os

# Get backend URL from environment
BACKEND_URL = os.getenv("REACT_APP_BACKEND_URL", "https://grant-engine-debug.preview.emergentagent.com")
API_BASE = f"{BACKEND_URL}/api"

def test_root_endpoint():
    """Test the root API endpoint"""
    print("\n=== Testing Root Endpoint ===")
    try:
        response = requests.get(f"{API_BASE}/", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert response.json()["message"] == "Hello World", "Unexpected response message"
        print("✅ Root endpoint test PASSED")
        return True
    except Exception as e:
        print(f"❌ Root endpoint test FAILED: {str(e)}")
        return False


def test_sam_uei_verification():
    """Test SAM.gov UEI verification endpoint"""
    print("\n=== Testing SAM.gov UEI Verification Endpoint ===")
    
    # Test 1: Invalid UEI format (too short)
    print("\n1. Testing invalid UEI format...")
    try:
        payload = {"uei": "123"}
        response = requests.post(f"{API_BASE}/sam/verify", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert data["success"] is False, "Expected success=False for invalid UEI"
        assert "Invalid UEI format" in data["error"], "Expected format validation error"
        print("✅ Invalid UEI format test PASSED")
    except Exception as e:
        print(f"❌ Invalid UEI format test FAILED: {str(e)}")
        return False
    
    # Test 2: Valid UEI (mock/sandbox)
    print("\n2. Testing valid UEI (sandbox mode)...")
    try:
        payload = {"uei": "UEI123456789"}
        response = requests.post(f"{API_BASE}/sam/verify", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert data["success"] is True, "Expected success=True for valid UEI"
        assert data["registration_status"] == "Active", "Expected Active registration status"
        assert data["legal_business_name"] == "PHMEG Solutions Federal Division", "Unexpected business name"
        assert data["active_exclusions"] is False, "Expected no active exclusions"
        assert data["is_eligible"] is True, "Expected eligible status"
        print("✅ Valid UEI verification test PASSED")
    except Exception as e:
        print(f"❌ Valid UEI verification test FAILED: {str(e)}")
        return False
    
    print("\n✅ All SAM.gov UEI verification tests PASSED")
    return True


def test_budget_visualizations():
    """Test budget visualization data generation endpoint"""
    print("\n=== Testing Budget Visualization Endpoint ===")
    
    try:
        payload = {
            "fte_allocations": {
                "Project Manager": 1.0,
                "Lead Developer": 0.75,
                "QA Engineer": 0.5
            },
            "personnel_costs": {
                "Personnel": 150000.0,
                "Travel": 25000.0,
                "Equipment": 50000.0,
                "Supplies": 10000.0
            }
        }
        
        response = requests.post(f"{API_BASE}/budget/visualizations", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Validate response structure
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert data["success"] is True, "Expected success=True"
        assert "total_budget" in data, "Missing total_budget field"
        assert "fte_chart_data" in data, "Missing fte_chart_data field"
        assert "cost_chart_data" in data, "Missing cost_chart_data field"
        
        # Validate total budget calculation
        expected_total = 235000.0
        assert data["total_budget"] == expected_total, f"Expected total {expected_total}, got {data['total_budget']}"
        
        # Validate FTE chart data
        fte_data = data["fte_chart_data"]
        assert len(fte_data) == 3, f"Expected 3 FTE entries, got {len(fte_data)}"
        
        # Check Project Manager (1.0 FTE = 100%)
        pm_entry = next((item for item in fte_data if item["name"] == "Project Manager"), None)
        assert pm_entry is not None, "Project Manager not found in FTE data"
        assert pm_entry["FTE"] == 1.0, f"Expected FTE 1.0, got {pm_entry['FTE']}"
        assert pm_entry["percentage"] == 100.0, f"Expected 100%, got {pm_entry['percentage']}"
        
        # Check Lead Developer (0.75 FTE = 75%)
        dev_entry = next((item for item in fte_data if item["name"] == "Lead Developer"), None)
        assert dev_entry is not None, "Lead Developer not found in FTE data"
        assert dev_entry["FTE"] == 0.75, f"Expected FTE 0.75, got {dev_entry['FTE']}"
        assert dev_entry["percentage"] == 75.0, f"Expected 75%, got {dev_entry['percentage']}"
        
        # Validate cost chart data
        cost_data = data["cost_chart_data"]
        assert len(cost_data) == 4, f"Expected 4 cost categories, got {len(cost_data)}"
        
        # Check Personnel cost (150k / 235k = 63.8%)
        personnel_entry = next((item for item in cost_data if item["category"] == "Personnel"), None)
        assert personnel_entry is not None, "Personnel not found in cost data"
        assert personnel_entry["cost"] == 150000.0, f"Expected cost 150000, got {personnel_entry['cost']}"
        assert 63.0 <= personnel_entry["percentage"] <= 64.0, f"Expected ~63.8%, got {personnel_entry['percentage']}"
        
        # Check Travel cost (25k / 235k = 10.6%)
        travel_entry = next((item for item in cost_data if item["category"] == "Travel"), None)
        assert travel_entry is not None, "Travel not found in cost data"
        assert travel_entry["cost"] == 25000.0, f"Expected cost 25000, got {travel_entry['cost']}"
        assert 10.0 <= travel_entry["percentage"] <= 11.0, f"Expected ~10.6%, got {travel_entry['percentage']}"
        
        print("✅ Budget visualization test PASSED")
        return True
        
    except Exception as e:
        print(f"❌ Budget visualization test FAILED: {str(e)}")
        return False


def test_empty_budget_visualizations():
    """Test budget visualization with empty data"""
    print("\n=== Testing Budget Visualization with Empty Data ===")
    
    try:
        payload = {
            "fte_allocations": {},
            "personnel_costs": {}
        }
        
        response = requests.post(f"{API_BASE}/budget/visualizations", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert data["success"] is True, "Expected success=True"
        assert data["total_budget"] == 0.0, f"Expected total 0.0, got {data['total_budget']}"
        assert len(data["fte_chart_data"]) == 0, "Expected empty FTE data"
        assert len(data["cost_chart_data"]) == 0, "Expected empty cost data"
        
        print("✅ Empty budget visualization test PASSED")
        return True
        
    except Exception as e:
        print(f"❌ Empty budget visualization test FAILED: {str(e)}")
        return False


def main():
    """Run all backend API tests"""
    print("=" * 80)
    print("GRANT AUTOMATION ENGINE - BACKEND API TEST SUITE")
    print("=" * 80)
    print(f"Testing backend at: {API_BASE}")
    
    results = []
    
    # Run all tests
    results.append(("Root Endpoint", test_root_endpoint()))
    results.append(("SAM.gov UEI Verification", test_sam_uei_verification()))
    results.append(("Budget Visualizations", test_budget_visualizations()))
    results.append(("Empty Budget Visualizations", test_empty_budget_visualizations()))
    
    # Print summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL BACKEND API TESTS PASSED!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
