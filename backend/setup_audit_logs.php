<?php
require_once 'config.php';

try {
    // Read and execute the SQL file
    $sql = file_get_contents('create_audit_logs_table.sql');
    
    if ($sql === false) {
        throw new Exception('Could not read SQL file');
    }
    
    $pdo->exec($sql);
    
    echo json_encode([
        'success' => true,
        'message' => 'Audit logs table created successfully'
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Failed to create audit logs table: ' . $e->getMessage()
    ]);
}
?>