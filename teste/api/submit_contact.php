<?php
require_once '../includes/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token($_POST['csrf_token'] ?? '')) {
        die("Invalid CSRF token.");
    }
    $nome_completo = $_POST['nome_completo'] ?? '';
    $cpf = $_POST['cpf'] ?? '';
    $endereco = $_POST['endereco'] ?? '';
    $endereco_evento = $_POST['endereco_evento'] ?? '';
    $data_evento = $_POST['data_evento'] ?? '';
    $horario = $_POST['horario'] ?? '';
    $quantidade_adultos = (int)($_POST['quantidade_adultos'] ?? 1);
    $quantidade_criancas = (int)($_POST['quantidade_criancas'] ?? 0);
    $telefone = $_POST['telefone'] ?? '';
    $observacoes = $_POST['observacoes'] ?? '';

    $id = generateUUID();

    try {
        $stmt = $pdo->prepare("INSERT INTO formularios_contato (id, nome_completo, cpf, endereco, endereco_evento, data_evento, horario, quantidade_adultos, quantidade_criancas, telefone, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id, $nome_completo, $cpf, $endereco, $endereco_evento, $data_evento, $horario, $quantidade_adultos, $quantidade_criancas, $telefone, $observacoes]);

        // Success redirect
        header("Location: ../index.php?success=1#contact");
    } catch (\Exception $e) {
        // Error redirect
        header("Location: ../index.php?error=1#contact");
    }
}
?>
