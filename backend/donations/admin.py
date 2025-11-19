from django.contrib import admin
from .models import Donation

@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'category', 'amount', 'donor_type', 'status', 'created_at']
    list_filter = ['category', 'donor_type', 'status', 'created_at']
    search_fields = ['name', 'email', 'receipt_number', 'pan_card']
    readonly_fields = ['receipt_number', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'email', 'pan_card', 'category', 'amount', 'things', 'donor_type')
        }),
        ('Family Details', {
            'fields': ('family_member_name', 'family_member_relation', 'family_member_contact'),
            'classes': ('collapse',)
        }),
        ('Affiliated Details', {
            'fields': ('affiliated_organization', 'affiliated_position', 'affiliated_contact'),
            'classes': ('collapse',)
        }),
        ('Corporate Details', {
            'fields': ('corporate_name', 'corporate_address', 'corporate_contact', 'corporate_gst'),
            'classes': ('collapse',)
        }),
        ('Foundation Details', {
            'fields': ('foundation_name', 'foundation_address', 'foundation_contact', 'foundation_registration'),
            'classes': ('collapse',)
        }),
        ('Additional Information', {
            'fields': ('purpose', 'message', 'payment_method', 'receipt_number', 'status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )