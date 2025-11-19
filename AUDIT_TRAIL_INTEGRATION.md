# Audit Trail Integration Guide

## Overview
This guide explains how to integrate the Audit Trail Maintenance feature into your NGOIndia website.

## Files Created

### Backend (PHP)
1. `backend/create_audit_logs_table.sql` - Database schema
2. `backend/audit_trail_api.php` - Main API endpoints
3. `backend/audit_middleware.php` - Middleware functions
4. `backend/export_audit_logs.php` - Export functionality
5. `backend/setup_audit_logs.php` - Database setup script

### Frontend (React/TypeScript)
1. `src/components/pages/AuditLogDashboard.tsx` - Main dashboard
2. `src/utils/auditApi.ts` - API utility functions

### Updated Files
1. `backend/add_donor_api.php` - Added audit logging
2. `src/App.tsx` - Added audit route
3. `src/components/pages/AddDonation.tsx` - Updated API call

## Setup Instructions

### 1. Database Setup
```bash
# Navigate to backend directory
cd backend

# Run the setup script to create the audit_logs table
php setup_audit_logs.php
```

### 2. Update Existing APIs
For each existing API file that performs database operations, add audit logging:

```php
// At the top of your API file
require_once 'audit_middleware.php';

// Replace direct database operations with audited versions
// Instead of:
$stmt = $pdo->prepare("INSERT INTO table_name ...");
$stmt->execute($data);

// Use:
$id = auditedInsert('table_name', $data, $userId);

// For updates:
auditedUpdate('table_name', $data, $whereConditions, $userId);

// For deletions:
auditedDelete('table_name', $whereConditions, $userId);
```

### 3. Frontend Integration
Add audit logging to your frontend components:

```typescript
import { logAction } from '../utils/auditApi';

// After successful operations
await logAction.create('donors', donorId, donorData, userId);
await logAction.update('projects', projectId, oldData, newData, userId);
await logAction.delete('campaigns', campaignId, campaignData, userId);
```

### 4. Navigation Setup
Add a link to the audit dashboard in your navigation:

```tsx
<a href="/audit-logs" className="nav-link">
  Audit Logs
</a>
```

## Security Features

### 1. Admin-Only Access
Add authentication middleware to protect audit endpoints:

```php
// In audit_trail_api.php, add at the top:
session_start();
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Access denied']);
    exit();
}
```

### 2. Sensitive Data Filtering
The system automatically filters sensitive fields:
- password
- token
- secret
- key
- auth
- credential

### 3. Immutable Logs
The audit_logs table should be configured with restricted permissions:
- Only INSERT and SELECT permissions for application user
- No UPDATE or DELETE permissions
- Consider using database triggers to prevent modifications

## API Endpoints

### Record Audit Event
```
POST /backend/audit_trail_api.php
Content-Type: application/json

{
  "action": "record",
  "data": {
    "user_id": 1,
    "action_type": "CREATE",
    "action_description": "Created new donor",
    "entity_name": "donors",
    "entity_id": "123",
    "new_values": {...},
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0..."
  }
}
```

### Get Audit Logs
```
GET /backend/audit_trail_api.php?page=1&limit=50&user_id=1&action_type=CREATE&date_from=2024-01-01
```

### Get Specific Log
```
GET /backend/audit_trail_api.php?id=123
```

### Export Logs
```
GET /backend/export_audit_logs.php?format=csv&date_from=2024-01-01&date_to=2024-12-31
```

## Usage Examples

### 1. Automatic Logging in APIs
```php
// In your existing API files
require_once 'audit_middleware.php';

// For donor creation
$donorId = auditedInsert('donors', [
    'donor_name' => $input['donorName'],
    'donor_email' => $input['donorEmail'],
    'amount' => $input['amount']
], $userId);
```

### 2. Manual Logging for Special Events
```php
recordAuditLog(
    'ROLE_CHANGE',
    'User role changed from volunteer to admin',
    'users',
    $userId,
    ['role' => 'volunteer'],
    ['role' => 'admin'],
    $adminUserId
);
```

### 3. Frontend Usage
```typescript
// In your React components
import { logAction } from '../utils/auditApi';

const handleLogin = async () => {
    // ... login logic
    await logAction.login(userId);
};

const handleDonationCreate = async (donationData) => {
    // ... create donation
    await logAction.create('donations', donationId, donationData, userId);
};
```

## Best Practices

### 1. What to Log
- All CRUD operations on sensitive data
- Authentication events (login/logout)
- Permission/role changes
- Configuration changes
- Data exports

### 2. What NOT to Log
- Passwords or sensitive credentials
- Personal identification numbers
- Payment card information
- Internal system tokens

### 3. Performance Considerations
- Audit logging is asynchronous where possible
- Use database indexing on frequently queried fields
- Consider log rotation for large datasets
- Monitor disk space usage

### 4. Compliance
- Ensure logs are tamper-proof
- Implement proper backup procedures
- Set appropriate retention policies
- Regular audit log reviews

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify MySQL credentials in config.php
   - Ensure audit_logs table exists

2. **Permission Denied**
   - Check user authentication
   - Verify admin role requirements

3. **Missing Audit Logs**
   - Ensure audit middleware is included
   - Check for PHP errors in logs
   - Verify API endpoints are being called

### Debug Mode
Enable debug logging by adding to your PHP files:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## Maintenance

### Regular Tasks
1. Monitor audit log table size
2. Archive old logs (>1 year)
3. Review access patterns
4. Update sensitive field filters as needed
5. Test export functionality monthly

### Backup Procedures
```sql
-- Create backup of audit logs
CREATE TABLE audit_logs_backup AS SELECT * FROM audit_logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Archive and clean old logs
DELETE FROM audit_logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

This implementation provides a comprehensive audit trail system that meets security best practices and compliance requirements while being easy to integrate with your existing NGOIndia website.