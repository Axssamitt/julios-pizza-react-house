<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyToken()) {
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
    // Basic bucket name validation
    if (!preg_match('/^[a-zA-Z0-9_-]+$/', $bucket)) {
        $bucket = 'uploads';
    }

    $targetDir = "../uploads/" . $bucket . "/";

    if (!file_exists($targetDir)) {
        mkdir($targetDir, 0777, true);
    }

    // Security: Validate file extension
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
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        $url = "$protocol://$host/uploads/$bucket/$fileName";
        echo json_encode(['url' => $url, 'path' => "$bucket/$fileName"]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to move uploaded file']);
    }
}
?>
