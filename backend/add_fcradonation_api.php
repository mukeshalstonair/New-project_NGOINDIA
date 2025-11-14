<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "ngoindia_db";
$port = 3307;

try {
    $pdo = new PDO("mysql:host=$servername;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }
    
    $sql = "INSERT INTO fcradonation (
        donor_name, donor_country, is_foreign, remittance_ref, currency, 
        amount, converted_amount, conversion_rate, firc, purpose_tag, 
        usage_restriction, notes, attachments, created_by, status, type
    ) VALUES (
        :donor_name, :donor_country, :is_foreign, :remittance_ref, :currency,
        :amount, :converted_amount, :conversion_rate, :firc, :purpose_tag,
        :usage_restriction, :notes, :attachments, :created_by, :status, :type
    )";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':donor_name' => $input['donorName'],
        ':donor_country' => $input['donorCountry'] ?? null,
        ':is_foreign' => $input['isForeign'] ? 1 : 0,
        ':remittance_ref' => $input['remittanceRef'] ?? null,
        ':currency' => $input['currency'] ?? 'INR',
        ':amount' => $input['amount'],
        ':converted_amount' => $input['convertedAmount'],
        ':conversion_rate' => $input['conversionRate'] ?? 1,
        ':firc' => $input['FIRC'] ?? null,
        ':purpose_tag' => $input['purposeTag'],
        ':usage_restriction' => $input['usageRestriction'] ?? null,
        ':notes' => $input['notes'] ?? null,
        ':attachments' => json_encode($input['attachments'] ?? []),
        ':created_by' => $input['createdBy'],
        ':status' => $input['status'] ?? 'completed',
        ':type' => $input['type'] ?? 'one-time'
    ]);
    
    $donationId = $pdo->lastInsertId();
    
    // Return the complete donation data for frontend integration
    echo json_encode([
        'success' => true,
        'message' => 'FCRA donation added successfully',
        'id' => $donationId,
        'donation' => [
            'id' => $donationId,
            'donorName' => $input['donorName'],
            'donorCountry' => $input['donorCountry'] ?? null,
            'isForeign' => $input['isForeign'] ? true : false,
            'remittanceRef' => $input['remittanceRef'] ?? null,
            'currency' => $input['currency'] ?? 'INR',
            'amount' => $input['amount'],
            'convertedAmount' => $input['convertedAmount'],
            'conversionRate' => $input['conversionRate'] ?? 1,
            'FIRC' => $input['FIRC'] ?? null,
            'purposeTag' => $input['purposeTag'],
            'usageRestriction' => $input['usageRestriction'] ?? null,
            'notes' => $input['notes'] ?? null,
            'attachments' => $input['attachments'] ?? [],
            'createdBy' => $input['createdBy'],
            'status' => $input['status'] ?? 'completed',
            'type' => $input['type'] ?? 'one-time',
            'createdAt' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>