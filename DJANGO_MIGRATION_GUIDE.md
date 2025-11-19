# PHP to Django Migration Guide

## Overview
This guide helps you migrate your NGO India PHP backend to Django framework while maintaining identical functionality.

## Prerequisites
- Python 3.8+
- MySQL Server
- pip (Python package manager)

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Database Configuration
Update `backend/settings.py` to use MySQL:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'ngoindia_db',
        'USER': 'root',
        'PASSWORD': '',
        'HOST': '127.0.0.1',
        'PORT': '3307',
    }
}
```

### 3. Run Migrations
```bash
python manage.py migrate
```

### 4. Create Superuser
```bash
python manage.py createsuperuser
```

### 5. Migrate Existing Data
```bash
python migrate_from_php.py
```

## API Endpoints Migration

### PHP → Django Endpoint Mapping

| PHP File | Django Endpoint | Method |
|----------|----------------|--------|
| `get_donations_api.php` | `/api/donations/` | GET |
| `add_donations_api.php` | `/api/donations/add/` | POST |
| `simple_login.php` | `/api/auth/simple-login/` | POST |

### Example API Usage

#### Get Donations
```javascript
fetch('http://localhost:8000/api/donations/')
  .then(response => response.json())
  .then(data => console.log(data));
```

#### Add Donation
```javascript
fetch('http://localhost:8000/api/donations/add/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    panCard: 'ABCDE1234F',
    category: 'money',
    amount: 1000,
    donorType: 'individual',
    purpose: 'Education'
  })
})
```

## Incremental Migration Strategy

### Phase 1: Setup Django (Week 1)
1. Set up Django project structure
2. Create models and migrations
3. Set up basic API endpoints
4. Test with existing frontend

### Phase 2: Core Features (Week 2)
1. Migrate donation system
2. Migrate authentication
3. Set up admin interface
4. Data migration from PHP

### Phase 3: Advanced Features (Week 3)
1. Migrate remaining modules (projects, campaigns, etc.)
2. Set up file uploads
3. Implement security features
4. Performance optimization

### Phase 4: Production Deployment (Week 4)
1. Set up production database
2. Configure static files
3. Set up reverse proxy
4. SSL configuration
5. Monitoring and logging

## Running Both Systems Simultaneously

### 1. Use Different Ports
- PHP: `http://localhost/your-php-app`
- Django: `http://localhost:8000`

### 2. Frontend Configuration
Update your frontend to gradually switch endpoints:
```javascript
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'http://localhost:8000/api' 
  : 'http://localhost/backend';
```

### 3. Database Synchronization
Run the migration script periodically to keep data in sync:
```bash
python migrate_from_php.py
```

## Security Improvements

### 1. Authentication
- Token-based authentication
- Password hashing with Django's built-in system
- Session management

### 2. Input Validation
- Django forms and serializers
- CSRF protection
- SQL injection prevention

### 3. File Upload Security
- File type validation
- Size limits
- Secure file storage

## Performance Optimizations

### 1. Database
- Database indexing
- Query optimization with Django ORM
- Connection pooling

### 2. Caching
- Redis/Memcached integration
- Template caching
- API response caching

### 3. Static Files
- Django's static file handling
- CDN integration for production

## Testing

### 1. Unit Tests
```bash
python manage.py test
```

### 2. API Testing
Use tools like Postman or create test scripts:
```python
from django.test import TestCase
from rest_framework.test import APIClient

class DonationAPITest(TestCase):
    def test_add_donation(self):
        client = APIClient()
        response = client.post('/api/donations/add/', {
            'name': 'Test User',
            'email': 'test@example.com',
            # ... other fields
        })
        self.assertEqual(response.status_code, 201)
```

## Deployment

### 1. Production Settings
Create `settings_prod.py`:
```python
from .settings import *

DEBUG = False
ALLOWED_HOSTS = ['your-domain.com']

# Production database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'ngoindia_prod',
        'USER': 'prod_user',
        'PASSWORD': 'secure_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

### 2. WSGI Configuration
```python
# wsgi.py
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings_prod')
application = get_wsgi_application()
```

### 3. Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location /static/ {
        alias /path/to/your/staticfiles/;
    }
    
    location /media/ {
        alias /path/to/your/media/;
    }
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Monitoring and Maintenance

### 1. Logging
Configure Django logging in settings:
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### 2. Health Checks
Create health check endpoints for monitoring.

### 3. Backup Strategy
- Regular database backups
- Media file backups
- Code repository backups

## Troubleshooting

### Common Issues
1. **MySQL Connection**: Ensure MySQL is running and credentials are correct
2. **CORS Issues**: Configure CORS settings for frontend integration
3. **Static Files**: Run `collectstatic` for production
4. **Migrations**: Always backup database before running migrations

### Support
- Django Documentation: https://docs.djangoproject.com/
- Django REST Framework: https://www.django-rest-framework.org/
- Community Support: Django forums and Stack Overflow