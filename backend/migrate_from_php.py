#!/usr/bin/env python
"""
Migration script to transfer data from PHP MySQL database to Django
Run this script after setting up Django models and migrations
"""

import os
import sys
import django
import pymysql
from decimal import Decimal
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from donations.models import Donation
from django.contrib.auth.models import User

# MySQL connection settings (from PHP config)
MYSQL_CONFIG = {
    'host': '127.0.0.1',
    'port': 3307,
    'user': 'root',
    'password': '',
    'database': 'ngoindia_db',
    'charset': 'utf8mb4'
}

def migrate_donations():
    """Migrate donations from PHP MySQL to Django"""
    try:
        # Connect to MySQL
        connection = pymysql.connect(**MYSQL_CONFIG)
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        
        # Fetch all donations
        cursor.execute("SELECT * FROM donations ORDER BY created_at")
        php_donations = cursor.fetchall()
        
        print(f"Found {len(php_donations)} donations to migrate...")
        
        migrated_count = 0
        for donation_data in php_donations:
            # Check if donation already exists
            if Donation.objects.filter(receipt_number=donation_data['receipt_number']).exists():
                print(f"Skipping existing donation: {donation_data['receipt_number']}")
                continue
            
            # Create Django donation object
            django_donation = Donation(
                name=donation_data['name'],
                email=donation_data['email'],
                pan_card=donation_data['pan_card'],
                category=donation_data['category'],
                amount=donation_data['amount'],
                things=donation_data['things'],
                donor_type=donation_data['donor_type'],
                family_member_name=donation_data['family_member_name'],
                family_member_relation=donation_data['family_member_relation'],
                family_member_contact=donation_data['family_member_contact'],
                affiliated_organization=donation_data['affiliated_organization'],
                affiliated_position=donation_data['affiliated_position'],
                affiliated_contact=donation_data['affiliated_contact'],
                corporate_name=donation_data['corporate_name'],
                corporate_address=donation_data['corporate_address'],
                corporate_contact=donation_data['corporate_contact'],
                corporate_gst=donation_data['corporate_gst'],
                foundation_name=donation_data['foundation_name'],
                foundation_address=donation_data['foundation_address'],
                foundation_contact=donation_data['foundation_contact'],
                foundation_registration=donation_data['foundation_registration'],
                purpose=donation_data['purpose'],
                message=donation_data['message'],
                payment_method=donation_data['payment_method'],
                receipt_number=donation_data['receipt_number'],
                status=donation_data['status'],
                created_at=donation_data['created_at'],
                updated_at=donation_data['updated_at']
            )
            
            django_donation.save()
            migrated_count += 1
            print(f"Migrated donation: {donation_data['receipt_number']}")
        
        print(f"Successfully migrated {migrated_count} donations")
        
    except Exception as e:
        print(f"Error migrating donations: {e}")
    finally:
        if 'connection' in locals():
            connection.close()

def create_staff_user():
    """Create the default staff user"""
    try:
        user, created = User.objects.get_or_create(
            username='staff@ngoindia.org',
            defaults={
                'email': 'staff@ngoindia.org',
                'first_name': 'NGO India',
                'last_name': 'Staff',
                'is_staff': True,
                'is_superuser': True
            }
        )
        
        if created:
            user.set_password('Ngoindia123@')
            user.save()
            print("Created default staff user")
        else:
            print("Staff user already exists")
            
    except Exception as e:
        print(f"Error creating staff user: {e}")

if __name__ == "__main__":
    print("Starting PHP to Django migration...")
    
    # Create staff user first
    create_staff_user()
    
    # Migrate donations
    migrate_donations()
    
    print("Migration completed!")