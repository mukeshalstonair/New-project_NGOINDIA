<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "ngoindia_db";
$port = 3307;

try {
    $pdo = new PDO("mysql:host=$servername;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create fcradonation table if it doesn't exist
    $sql = "CREATE TABLE IF NOT EXISTS fcradonation (
        id INT AUTO_INCREMENT PRIMARY KEY,
        donor_name VARCHAR(255) NOT NULL,
        donor_country VARCHAR(100) NULL,
        is_foreign BOOLEAN DEFAULT FALSE,
        remittance_ref VARCHAR(100) NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        amount DECIMAL(10,2) NOT NULL,
        converted_amount DECIMAL(10,2) NOT NULL,
        conversion_rate DECIMAL(8,4) DEFAULT 1,
        firc VARCHAR(100) NULL,
        purpose_tag VARCHAR(255) NOT NULL,
        usage_restriction TEXT NULL,
        notes TEXT NULL,
        attachments JSON NULL,
        created_by VARCHAR(255) NOT NULL,
        status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
        type ENUM('one-time', 'recurring') DEFAULT 'one-time',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    $pdo->exec($sql);
    
    // Create indexes
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_fcradonation_donor ON fcradonation(donor_name)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_fcradonation_foreign ON fcradonation(is_foreign)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_fcradonation_created_at ON fcradonation(created_at)");
    
    echo json_encode([
        'success' => true,
        'message' => 'FCRA donation table setup completed successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database setup error: ' . $e->getMessage()
    ]);
}
?>