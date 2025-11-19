from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
import random
import string
from .models import Donation
from .serializers import DonationSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def get_donations(request):
    """Get all donations - equivalent to get_donations_api.php"""
    try:
        donations = Donation.objects.all().order_by('-created_at')
        serializer = DonationSerializer(donations, many=True)
        return Response({
            'success': True,
            'donations': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Database error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def add_donation(request):
    """Add new donation - equivalent to add_donations_api.php"""
    try:
        data = request.data.copy()
        
        # Generate receipt number
        current_year = timezone.now().year
        random_number = ''.join(random.choices(string.digits, k=5))
        receipt_number = f'NGO-{current_year}-{random_number}'
        data['receipt_number'] = receipt_number
        
        # Handle category-specific fields
        if data.get('category') == 'money':
            data['things'] = None
        elif data.get('category') == 'things':
            data['amount'] = None
        
        serializer = DonationSerializer(data=data)
        if serializer.is_valid():
            donation = serializer.save()
            return Response({
                'success': True,
                'message': 'Donation added successfully',
                'receipt_number': receipt_number,
                'donation_id': donation.id
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'error': 'Validation failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Database error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)