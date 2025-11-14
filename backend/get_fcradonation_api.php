<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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
    
    $sql = "SELECT * FROM fcradonation ORDER BY created_at DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    
    $donations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Convert to frontend format
    $formattedDonations = [];
    foreach ($donations as $donation) {
        $formattedDonations[] = [
            'id' => $donation['id'],
            'donorName' => $donation['donor_name'],
            'donorCountry' => $donation['donor_country'],
            'isForeign' => (bool)$donation['is_foreign'],
            'remittanceRef' => $donation['remittance_ref'],
            'currency' => $donation['currency'],
            'amount' => (float)$donation['amount'],
            'convertedAmount' => (float)$donation['converted_amount'],
            'conversionRate' => (float)$donation['conversion_rate'],
            'FIRC' => $donation['firc'],
            'purposeTag' => $donation['purpose_tag'],
            'usageRestriction' => $donation['usage_restriction'],
            'notes' => $donation['notes'],
            'attachments' => json_decode($donation['attachments'] ?? '[]', true),
            'createdBy' => $donation['created_by'],
            'status' => $donation['status'],
            'type' => $donation['type'],
            'createdAt' => $donation['created_at']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'results' => $formattedDonations
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>