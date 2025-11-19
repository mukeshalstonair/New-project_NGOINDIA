<?php
require_once 'audit_middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Only POST method allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['audit_type'])) {
    echo json_encode(['success' => false, 'error' => 'Audit type is required']);
    exit();
}

try {
    switch ($input['audit_type']) {
        case 'text_change':
            if (!isset($input['entity_name'], $input['entity_id'], $input['field_name'], $input['old_text'], $input['new_text'])) {
                throw new Exception('Missing required fields for text audit');
            }
            
            auditTextChange(
                $input['entity_name'],
                $input['entity_id'],
                $input['field_name'],
                $input['old_text'],
                $input['new_text'],
                $input['user_id'] ?? null
            );
            
            echo json_encode(['success' => true, 'message' => 'Text change audited successfully']);
            break;
            
        case 'image_upload':
            if (!isset($input['entity_name'], $input['entity_id'], $input['image_path'])) {
                throw new Exception('Missing required fields for image upload audit');
            }
            
            $imageInfo = $input['image_info'] ?? [];
            
            auditImageUpload(
                $input['entity_name'],
                $input['entity_id'],
                $input['image_path'],
                $imageInfo,
                $input['user_id'] ?? null
            );
            
            echo json_encode(['success' => true, 'message' => 'Image upload audited successfully']);
            break;
            
        case 'image_change':
            if (!isset($input['entity_name'], $input['entity_id'], $input['old_image_path'], $input['new_image_path'])) {
                throw new Exception('Missing required fields for image change audit');
            }
            
            auditImageChange(
                $input['entity_name'],
                $input['entity_id'],
                $input['old_image_path'],
                $input['new_image_path'],
                $input['user_id'] ?? null
            );
            
            echo json_encode(['success' => true, 'message' => 'Image change audited successfully']);
            break;
            
        default:
            throw new Exception('Invalid audit type');
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>