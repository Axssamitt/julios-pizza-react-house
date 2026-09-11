<?php
$config = require_once __DIR__ . '/config.php';

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
    'nome_completo', 'cpf', 'endereco_evento', 'data_evento',
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

$resendApiKey = $config['resend_api_key'] ?? getenv('RESEND_API_KEY') ?: '';
if ($resendApiKey === '') {
    error_log('Chave do Resend não configurada em config.php ou RESEND_API_KEY.');
    http_response_code(500);
    echo json_encode(['error' => 'Email notification is not configured']);
    exit;
}

function emailValue($value): string {
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function getWhatsAppNumber(string $phone): string {
    $numbersOnly = preg_replace('/\D/', '', $phone);
    if (substr($numbersOnly, 0, 2) === '55' && strlen($numbersOnly) >= 12) {
        return $numbersOnly;
    }
    if (strlen($numbersOnly) === 11) {
        return '55' . $numbersOnly;
    }
    if (strlen($numbersOnly) === 10) {
        return '5543' . $numbersOnly;
    }
    return $numbersOnly;
}

$adults = (int) $data['quantidade_adultos'];
$children = (int) $data['quantidade_criancas'];
$date = DateTime::createFromFormat('!Y-m-d', (string) $data['data_evento']);
$formattedDate = $date ? $date->format('d/m/Y') : emailValue($data['data_evento']);
$whatsappMessage = rawurlencode(
    "NOVO ORÇAMENTO - Julio's Pizza House\n\n" .
    "Cliente: {$data['nome_completo']}\n" .
    "CPF/CNPJ: {$data['cpf']}\n" .
    "Telefone: {$data['telefone']}\n\n" .
    "Data do Evento: {$formattedDate}\n" .
    "Horário: {$data['horario']}\n" .
    "Local: {$data['endereco_evento']}\n\n" .
    "Adultos: {$adults}\n" .
    "Crianças: {$children}\n" .
    "Total: " . ($adults + $children) . " pessoas"
);
$whatsappLink = 'https://wa.me/' . getWhatsAppNumber((string) $data['telefone']) . '?text=' . $whatsappMessage;

$html = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">'
    . '<h1 style="color: #f97316; text-align: center;">Novo Orçamento Recebido</h1>'
    . '<div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0;">'
    . '<h2>Dados do Cliente</h2>'
    . '<p><strong>Nome:</strong> ' . emailValue($data['nome_completo']) . '</p>'
    . '<p><strong>CPF/CNPJ:</strong> ' . emailValue($data['cpf']) . '</p>'
    . '<p><strong>Telefone:</strong> ' . emailValue($data['telefone']) . '</p>'
    . '<p><strong>Endereço residencial:</strong> ' . emailValue($data['endereco'] ?? '') . '</p>'
    . '</div>'
    . '<div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0;">'
    . '<h2>Detalhes do Evento</h2>'
    . '<p><strong>Data:</strong> ' . $formattedDate . '</p>'
    . '<p><strong>Horário:</strong> ' . emailValue($data['horario']) . '</p>'
    . '<p><strong>Local:</strong> ' . emailValue($data['endereco_evento']) . '</p>'
    . '<p><strong>Adultos:</strong> ' . $adults . '</p>'
    . '<p><strong>Crianças:</strong> ' . $children . '</p>'
    . '<p><strong>Observações:</strong> ' . nl2br(emailValue($data['observacoes'] ?? '')) . '</p>'
    . '</div>'
    . '<p style="text-align: center;"><a href="' . htmlspecialchars($whatsappLink, ENT_QUOTES, 'UTF-8') . '">Responder via WhatsApp do solicitante</a></p>'
    . '</div>';

$payload = json_encode([
    'from' => $config['resend_from'] ?? "Julio's Pizza House <onboarding@resend.dev>",
    'to' => [$config['resend_to'] ?? 'juliospizzahouse@gmail.com'],
    'subject' => "Novo Orçamento Recebido - Julio's Pizza House",
    'html' => $html
]);

$ch = curl_init('https://api.resend.com/emails');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $resendApiKey,
        'Content-Type: application/json',
        'Content-Length: ' . strlen($payload)
    ],
    CURLOPT_TIMEOUT => 15
]);
$response = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false || $status < 200 || $status >= 300) {
    error_log('Erro ao enviar notificação pelo Resend: ' . ($curlError ?: $response));
    http_response_code(502);
    echo json_encode(['error' => 'Email provider failed']);
    exit;
}

echo json_encode(['success' => true]);