#!/usr/bin/env python
"""
Test script to verify Django migration is working correctly
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from donations.models import Donation
from django.contrib.auth.models import User

def test_models():
    """Test that Django models are working"""
    print("Testing Django models...")
    
    # Test creating a donation
    try:
        donation = Donation.objects.create(
            name="Test User",
            email="test@example.com",
            pan_card="ABCDE1234F",
            category="money",
            amount=1000.00,
            donor_type="individual",
            purpose="Testing",
            receipt_number="TEST-2024-12345"
        )
        print(f"[OK] Created test donation: {donation.receipt_number}")
        
        # Clean up
        donation.delete()
        print("[OK] Donation model test passed")
        
    except Exception as e:
        print(f"[ERROR] Donation model test failed: {e}")

def test_user_creation():
    """Test user creation"""
    print("Testing user creation...")
    
    try:
        user, created = User.objects.get_or_create(
            username='test@example.com',
            defaults={
                'email': 'test@example.com',
                'first_name': 'Test',
                'last_name': 'User'
            }
        )
        
        if created:
            print("[OK] Created test user")
            user.delete()
        else:
            print("[OK] User already exists")
            
        print("[OK] User creation test passed")
        
    except Exception as e:
        print(f"[ERROR] User creation test failed: {e}")

def test_api_endpoints():
    """Test API endpoints (requires server to be running)"""
    print("Testing API endpoints...")
    print("[WARNING] API endpoint testing requires 'requests' library")
    print("Install with: pip install requests")
    print("Then start server with: python manage.py runserver")
    print("And test endpoints manually at: http://localhost:8000/api/donations/")

if __name__ == "__main__":
    print("Running Django migration tests...\n")
    
    test_models()
    print()
    
    test_user_creation()
    print()
    
    test_api_endpoints()
    print()
    
    print("Test completed!")
    print("\nTo start the Django server, run:")
    print("python manage.py runserver")