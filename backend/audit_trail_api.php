<?php
require_once 'config.php';

class AuditTrail {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    public function recordAuditEvent($data) {
        try {
            $stmt = $this->pdo->prepare("
                INSERT INTO audit_logs (user_id, action_type, action_description, entity_name, entity_id, previous_values, new_values, text_content, image_data, ip_address, user_agent) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            return $stmt->execute([
                $data['user_id'] ?? null,
                $data['action_type'],
                $data['action_description'],
                $data['entity_name'],
                $data['entity_id'] ?? null,
                isset($data['previous_values']) ? json_encode($data['previous_values']) : null,
                isset($data['new_values']) ? json_encode($data['new_values']) : null,
                $data['text_content'] ?? null,
                isset($data['image_data']) ? json_encode($data['image_data']) : null,
                $data['ip_address'],
                $data['user_agent'] ?? null
            ]);
        } catch (Exception $e) {
            error_log("Audit log error: " . $e->getMessage());
            return false;
        }
    }
    
    public function getAuditLogs($filters = [], $page = 1, $limit = 50) {
        $offset = ($page - 1) * $limit;
        $where = [];
        $params = [];
        
        if (!empty($filters['user_id'])) {
            $where[] = "user_id = ?";
            $params[] = $filters['user_id'];
        }
        
        if (!empty($filters['action_type'])) {
            $where[] = "action_type = ?";
            $params[] = $filters['action_type'];
        }
        
        if (!empty($filters['entity_name'])) {
            $where[] = "entity_name = ?";
            $params[] = $filters['entity_name'];
        }
        
        if (!empty($filters['date_from'])) {
            $where[] = "timestamp >= ?";
            $params[] = $filters['date_from'];
        }
        
        if (!empty($filters['date_to'])) {
            $where[] = "timestamp <= ?";
            $params[] = $filters['date_to'];
        }
        
        $whereClause = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";
        
        $stmt = $this->pdo->prepare("
            SELECT * FROM audit_logs 
            $whereClause 
            ORDER BY timestamp DESC 
            LIMIT ? OFFSET ?
        ");
        
        $params[] = $limit;
        $params[] = $offset;
        $stmt->execute($params);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getAuditLogById($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM audit_logs WHERE log_id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function getTotalCount($filters = []) {
        $where = [];
        $params = [];
        
        if (!empty($filters['user_id'])) {
            $where[] = "user_id = ?";
            $params[] = $filters['user_id'];
        }
        
        if (!empty($filters['action_type'])) {
            $where[] = "action_type = ?";
            $params[] = $filters['action_type'];
        }
        
        if (!empty($filters['entity_name'])) {
            $where[] = "entity_name = ?";
            $params[] = $filters['entity_name'];
        }
        
        if (!empty($filters['date_from'])) {
            $where[] = "timestamp >= ?";
            $params[] = $filters['date_from'];
        }
        
        if (!empty($filters['date_to'])) {
            $where[] = "timestamp <= ?";
            $params[] = $filters['date_to'];
        }
        
        $whereClause = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";
        
        $stmt = $this->pdo->prepare("SELECT COUNT(*) as total FROM audit_logs $whereClause");
        $stmt->execute($params);
        
        return $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    }
}

$audit = new AuditTrail($pdo);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (isset($input['action']) && $input['action'] === 'record') {
        $result = $audit->recordAuditEvent($input['data']);
        echo json_encode(['success' => $result]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        $log = $audit->getAuditLogById($_GET['id']);
        echo json_encode(['success' => true, 'data' => $log]);
    } else {
        $filters = [
            'user_id' => $_GET['user_id'] ?? null,
            'action_type' => $_GET['action_type'] ?? null,
            'entity_name' => $_GET['entity_name'] ?? null,
            'date_from' => $_GET['date_from'] ?? null,
            'date_to' => $_GET['date_to'] ?? null
        ];
        
        $page = intval($_GET['page'] ?? 1);
        $limit = intval($_GET['limit'] ?? 50);
        
        $logs = $audit->getAuditLogs($filters, $page, $limit);
        $total = $audit->getTotalCount($filters);
        
        echo json_encode([
            'success' => true,
            'data' => $logs,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }
}
?>