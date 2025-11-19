@echo off
echo Deleting standalone audit log files...

del "src\components\pages\AuditLogDashboard.tsx" 2>nul
del "src\utils\auditApi.ts" 2>nul

echo Audit log files deleted. Only dashboard module remains.
pause