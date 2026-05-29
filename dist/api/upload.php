<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

$file = $_FILES['file'] ?? null;
$folder = $_POST['folder'] ?? 'general';

if (!$file) {
    http_response_code(400);
    echo json_encode(['error' => 'Nenhum arquivo enviado']);
    exit;
}

$uploadDir = 'uploads/' . $folder . '/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid() . '.' . $extension;
$targetPath = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    // Retorna a URL relativa para o frontend
    echo json_encode([
        'path' => $folder . '/' . $filename,
        'url' => 'uploads/' . $folder . '/' . $filename
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao salvar o arquivo']);
}
