from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
import json
# from .models import StaffProfile  # Not needed

@csrf_exempt
@require_http_methods(["POST"])
def simple_login(request):
    """Simple login endpoint - equivalent to simple_login.php"""
    try:
        data = json.loads(request.body)
        email = data.get('email', '')
        password = data.get('password', '')
        
        if not email or not password:
            return JsonResponse({'success': False, 'error': 'Email and password required'}, status=400)
        
        # Hardcoded login for staff (matching PHP logic)
        if email == 'staff@ngoindia.org' and password == 'Ngoindia123@':
            # Create or get user
            user, created = User.objects.get_or_create(
                username='staff@ngoindia.org',
                defaults={
                    'email': 'staff@ngoindia.org',
                    'first_name': 'NGO India',
                    'last_name': 'Staff',
                    'is_staff': True
                }
            )
            
            # Create or get token
            token, created = Token.objects.get_or_create(user=user)
            
            return JsonResponse({
                'success': True,
                'user': {
                    'id': str(user.id),
                    'name': f'{user.first_name} {user.last_name}',
                    'email': user.email,
                    'role': 'staff'
                },
                'token': token.key
            })
        
        # Try database authentication
        user = authenticate(username=email, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return JsonResponse({
                'success': True,
                'user': {
                    'id': str(user.id),
                    'name': f'{user.first_name} {user.last_name}',
                    'email': user.email,
                    'role': 'staff' if user.is_staff else 'user'
                },
                'token': token.key
            })
        else:
            return JsonResponse({'success': False, 'error': 'Invalid credentials'}, status=401)
            
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': f'Server error: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def staff_login(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return JsonResponse({'success': False, 'error': 'Email and password required'}, status=400)
        
        # Check credentials against database
        try:
            user = User.objects.get(email=email)
            if user.check_password(password) and user.is_active:
                return JsonResponse({
                    'success': True,
                    'user': {
                        'id': str(user.id),
                        'name': f'{user.first_name} {user.last_name}',
                        'email': user.email,
                        'role': 'staff' if user.is_staff else 'user'
                    }
                })
            else:
                return JsonResponse({'success': False, 'error': 'Invalid credentials'}, status=401)
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Invalid credentials'}, status=401)
            
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': 'Server error'}, status=500)