<?php
require_once __DIR__ . '/db.php';

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = $config['allowed_origins'] ?? [];
if ($origin && in_array($origin, $allowed, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$requiredFields = [
    'nome_completo', 'cpf', 'endereco', 'endereco_evento', 'data_evento',
    'horario', 'quantidade_adultos', 'quantidade_criancas', 'telefone'
];

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON payload']);
    exit;
}

foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || trim((string) $data[$field]) === '') {
        http_response_code(400);
        echo json_encode(['error' => "Missing field: {$field}"]);
        exit;
    }
}

$id = generateUUID();
$adults = (int) $data['quantidade_adultos'];
$children = (int) $data['quantidade_criancas'];

try {
    $stmt = $pdo->prepare(
        'INSERT INTO formularios_contato '
        . '(id, nome_completo, cpf, endereco, endereco_evento, data_evento, horario, '
        . 'quantidade_adultos, quantidade_criancas, telefone, observacoes, status) '
        . 'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $id,
        $data['nome_completo'],
        preg_replace('/\D/', '', (string) $data['cpf']),
        $data['endereco'],
        $data['endereco_evento'],
        $data['data_evento'],
        $data['horario'],
        $adults,
        $children,
        $data['telefone'],
        $data['observacoes'] ?? '',
        'pendente'
    ]);

    echo json_encode(['success' => true, 'id' => $id]);
} catch (Exception $error) {
    error_log('Erro ao salvar formulário: ' . $error->getMessage());
    http_response_code(400);
    echo json_encode(['error' => 'Database error']);
}
