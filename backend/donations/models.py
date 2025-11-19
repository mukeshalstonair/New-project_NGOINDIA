from django.db import models
from django.contrib.auth.models import User

class Donation(models.Model):
    CATEGORY_CHOICES = [
        ('money', 'Money'),
        ('things', 'Things'),
    ]
    
    DONOR_TYPE_CHOICES = [
        ('individual', 'Individual'),
        ('family', 'Family'),
        ('affiliated', 'Affiliated'),
        ('corporate', 'Corporate'),
        ('grant', 'Grant/Foundation'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('card', 'Card'),
        ('upi', 'UPI'),
        ('netbanking', 'Net Banking'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    # Basic donation info
    name = models.CharField(max_length=255)
    email = models.EmailField()
    pan_card = models.CharField(max_length=10)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    things = models.TextField(null=True, blank=True)
    donor_type = models.CharField(max_length=20, choices=DONOR_TYPE_CHOICES)
    
    # Family member details
    family_member_name = models.CharField(max_length=255, null=True, blank=True)
    family_member_relation = models.CharField(max_length=100, null=True, blank=True)
    family_member_contact = models.CharField(max_length=20, null=True, blank=True)
    
    # Affiliated details
    affiliated_organization = models.CharField(max_length=255, null=True, blank=True)
    affiliated_position = models.CharField(max_length=255, null=True, blank=True)
    affiliated_contact = models.CharField(max_length=20, null=True, blank=True)
    
    # Corporate details
    corporate_name = models.CharField(max_length=255, null=True, blank=True)
    corporate_address = models.TextField(null=True, blank=True)
    corporate_contact = models.CharField(max_length=20, null=True, blank=True)
    corporate_gst = models.CharField(max_length=15, null=True, blank=True)
    
    # Grant/Foundation details
    foundation_name = models.CharField(max_length=255, null=True, blank=True)
    foundation_address = models.TextField(null=True, blank=True)
    foundation_contact = models.CharField(max_length=20, null=True, blank=True)
    foundation_registration = models.CharField(max_length=100, null=True, blank=True)
    
    # Additional info
    purpose = models.CharField(max_length=500)
    message = models.TextField(null=True, blank=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, null=True, blank=True)
    receipt_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'donations'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['receipt_number']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.receipt_number}"