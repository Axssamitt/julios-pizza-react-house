<?php
require_once '../includes/db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Only allow token-based or session-based upload for security
    if (!is_logged_in()) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    if (!isset($_FILES['file'])) {
        echo json_encode(['error' => 'No file uploaded']);
        exit;
    }

    $file = $_FILES['file'];
    $bucket = $_POST['bucket'] ?? 'uploads';
    if (!preg_match('/^[a-zA-Z0-9_-]+$/', $bucket)) {
        $bucket = 'uploads';
    }

    $targetDir = "../uploads/" . $bucket . "/";

    if (!file_exists($targetDir)) {
        mkdir($targetDir, 0777, true);
    }

    $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'];
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, $allowed_extensions)) {
        http_response_code(400);
        echo json_encode(['error' => 'File type not allowed']);
        exit;
    }

    $fileName = time() . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
    $targetFile = $targetDir . $fileName;

    if (move_uploaded_file($file['tmp_name'], $targetFile)) {
        // Return relative path for easier use in the teste/ structure
        $url = "uploads/$bucket/$fileName";
        echo json_encode(['url' => $url, 'path' => "$bucket/$fileName"]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to move uploaded file']);
    }
}
?>
