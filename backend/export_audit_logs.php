<?php
require_once 'audit_trail_api.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    exit();
}

$filters = [
    'user_id' => $_GET['user_id'] ?? null,
    'action_type' => $_GET['action_type'] ?? null,
    'entity_name' => $_GET['entity_name'] ?? null,
    'date_from' => $_GET['date_from'] ?? null,
    'date_to' => $_GET['date_to'] ?? null
];

$format = $_GET['format'] ?? 'csv';
$audit = new AuditTrail($pdo);

// Get all logs without pagination for export
$logs = $audit->getAuditLogs($filters, 1, 10000);

if ($format === 'csv') {
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="audit_logs_' . date('Y-m-d') . '.csv"');
    
    $output = fopen('php://output', 'w');
    
    // CSV Headers
    fputcsv($output, [
        'Log ID', 'User ID', 'Action Type', 'Description', 'Entity Name', 
        'Entity ID', 'IP Address', 'Timestamp'
    ]);
    
    foreach ($logs as $log) {
        fputcsv($output, [
            $log['log_id'],
            $log['user_id'],
            $log['action_type'],
            $log['action_description'],
            $log['entity_name'],
            $log['entity_id'],
            $log['ip_address'],
            $log['timestamp']
        ]);
    }
    
    fclose($output);
} else {
    // JSON format
    header('Content-Type: application/json');
    header('Content-Disposition: attachment; filename="audit_logs_' . date('Y-m-d') . '.json"');
    echo json_encode($logs, JSON_PRETTY_PRINT);
}
?>