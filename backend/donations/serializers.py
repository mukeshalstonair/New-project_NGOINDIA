from rest_framework import serializers
from .models import Donation

class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = '__all__'
        
    def validate(self, data):
        """Custom validation for donation data"""
        category = data.get('category')
        
        if category == 'money' and not data.get('amount'):
            raise serializers.ValidationError("Amount is required for money donations")
        
        if category == 'things' and not data.get('things'):
            raise serializers.ValidationError("Things description is required for item donations")
        
        return data