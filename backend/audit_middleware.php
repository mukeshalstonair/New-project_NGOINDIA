<?php
require_once 'audit_trail_api.php';

function getClientIP() {
    $ipKeys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    foreach ($ipKeys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

function recordAuditLog($actionType, $description, $entityName, $entityId = null, $previousValues = null, $newValues = null, $userId = null, $textContent = null, $imageData = null) {
    global $pdo;
    
    // Filter sensitive data
    if ($newValues) {
        $filteredNew = filterSensitiveData($newValues);
    }
    if ($previousValues) {
        $filteredPrevious = filterSensitiveData($previousValues);
    }
    
    $audit = new AuditTrail($pdo);
    $audit->recordAuditEvent([
        'user_id' => $userId,
        'action_type' => $actionType,
        'action_description' => $description,
        'entity_name' => $entityName,
        'entity_id' => $entityId,
        'previous_values' => $filteredPrevious ?? null,
        'new_values' => $filteredNew ?? null,
        'text_content' => $textContent,
        'image_data' => $imageData,
        'ip_address' => getClientIP(),
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null
    ]);
}

function filterSensitiveData($data) {
    $sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
    
    if (is_array($data)) {
        foreach ($data as $key => $value) {
            foreach ($sensitiveFields as $sensitive) {
                if (stripos($key, $sensitive) !== false) {
                    $data[$key] = '[FILTERED]';
                    break;
                }
            }
            if (is_array($value)) {
                $data[$key] = filterSensitiveData($value);
            }
        }
    }
    
    return $data;
}

// Auto-audit wrapper for database operations
function auditedInsert($table, $data, $userId = null) {
    global $pdo;
    
    $columns = implode(',', array_keys($data));
    $placeholders = ':' . implode(', :', array_keys($data));
    
    $stmt = $pdo->prepare("INSERT INTO $table ($columns) VALUES ($placeholders)");
    $result = $stmt->execute($data);
    
    if ($result) {
        $entityId = $pdo->lastInsertId();
        recordAuditLog('CREATE', "Created new $table record", $table, $entityId, null, $data, $userId);
        return $entityId;
    }
    
    return false;
}

function auditedUpdate($table, $data, $where, $userId = null) {
    global $pdo;
    
    // Get previous values
    $whereClause = implode(' AND ', array_map(fn($k) => "$k = :where_$k", array_keys($where)));
    $selectStmt = $pdo->prepare("SELECT * FROM $table WHERE $whereClause");
    $whereParams = array_combine(array_map(fn($k) => "where_$k", array_keys($where)), array_values($where));
    $selectStmt->execute($whereParams);
    $previousValues = $selectStmt->fetch(PDO::FETCH_ASSOC);
    
    // Perform update
    $setClause = implode(',', array_map(fn($k) => "$k = :$k", array_keys($data)));
    $stmt = $pdo->prepare("UPDATE $table SET $setClause WHERE $whereClause");
    $result = $stmt->execute(array_merge($data, $whereParams));
    
    if ($result && $previousValues) {
        $entityId = $previousValues[array_keys($where)[0]] ?? null;
        recordAuditLog('UPDATE', "Updated $table record", $table, $entityId, $previousValues, $data, $userId);
    }
    
    return $result;
}

function auditedDelete($table, $where, $userId = null) {
    global $pdo;
    
    // Get record before deletion
    $whereClause = implode(' AND ', array_map(fn($k) => "$k = :$k", array_keys($where)));
    $selectStmt = $pdo->prepare("SELECT * FROM $table WHERE $whereClause");
    $selectStmt->execute($where);
    $previousValues = $selectStmt->fetch(PDO::FETCH_ASSOC);
    
    // Perform deletion
    $stmt = $pdo->prepare("DELETE FROM $table WHERE $whereClause");
    $result = $stmt->execute($where);
    
    if ($result && $previousValues) {
        $entityId = $previousValues[array_keys($where)[0]] ?? null;
        recordAuditLog('DELETE', "Deleted $table record", $table, $entityId, $previousValues, null, $userId);
    }
    
    return $result;
}

// Text audit functions
function auditTextChange($entityName, $entityId, $fieldName, $oldText, $newText, $userId = null) {
    $textDiff = [
        'field' => $fieldName,
        'old_length' => strlen($oldText),
        'new_length' => strlen($newText),
        'changes' => getTextDiff($oldText, $newText)
    ];
    
    recordAuditLog(
        'TEXT_CHANGE',
        "Text changed in $fieldName for $entityName",
        $entityName,
        $entityId,
        ['text' => $oldText],
        ['text' => $newText],
        $userId,
        json_encode($textDiff)
    );
}

function getTextDiff($oldText, $newText) {
    $oldWords = explode(' ', $oldText);
    $newWords = explode(' ', $newText);
    
    return [
        'words_added' => count($newWords) - count($oldWords),
        'char_diff' => strlen($newText) - strlen($oldText),
        'similarity' => similar_text($oldText, $newText, $percent),
        'similarity_percent' => round($percent, 2)
    ];
}

// Image audit functions
function auditImageUpload($entityName, $entityId, $imagePath, $imageInfo, $userId = null) {
    $imageData = [
        'file_path' => $imagePath,
        'file_size' => $imageInfo['size'] ?? null,
        'file_type' => $imageInfo['type'] ?? null,
        'dimensions' => $imageInfo['dimensions'] ?? null,
        'upload_time' => date('Y-m-d H:i:s')
    ];
    
    recordAuditLog(
        'UPLOAD',
        "Image uploaded for $entityName",
        $entityName,
        $entityId,
        null,
        ['image_path' => $imagePath],
        $userId,
        null,
        $imageData
    );
}

function auditImageChange($entityName, $entityId, $oldImagePath, $newImagePath, $userId = null) {
    $imageData = [
        'old_image' => $oldImagePath,
        'new_image' => $newImagePath,
        'change_time' => date('Y-m-d H:i:s')
    ];
    
    recordAuditLog(
        'UPDATE',
        "Image changed for $entityName",
        $entityName,
        $entityId,
        ['image_path' => $oldImagePath],
        ['image_path' => $newImagePath],
        $userId,
        null,
        $imageData
    );
}

function getImageInfo($imagePath) {
    if (!file_exists($imagePath)) {
        return null;
    }
    
    $info = getimagesize($imagePath);
    $fileSize = filesize($imagePath);
    
    return [
        'dimensions' => $info ? $info[0] . 'x' . $info[1] : null,
        'type' => $info ? $info['mime'] : null,
        'size' => $fileSize
    ];
}
?>