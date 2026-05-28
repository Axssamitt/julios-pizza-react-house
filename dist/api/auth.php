<?php
require_once 'db.php';

$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true);

if ($action === 'login') {
    $email = $input['email'] ?? '';
    $senha = $input['senha'] ?? '';

    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ? AND ativo = 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // Nota: Em um sistema real, as senhas devem ser armazenadas usando password_hash()
    // e verificadas com password_verify().
    if ($user && ($senha === $user['senha'] || password_verify($senha, $user['senha']))) {
        unset($user['senha']);

        // Geração de token simplificada para o desafio.
        // Em produção, utilize uma biblioteca JWT robusta (ex: firebase/php-jwt)
        // com uma chave secreta vinda de variável de ambiente.
        $payload = [
            'id' => $user['id'],
            'email' => $user['email'],
            'exp' => time() + 86400
        ];
        $token = base64_encode(json_encode($payload));

        echo json_encode(['token' => $token, 'user' => $user]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Credenciais inválidas']);
    }
} elseif ($action === 'me') {
    $token = getBearerToken();
    if (!$token) {
        http_response_code(401);
        echo json_encode(['error' => 'Não autorizado']);
        exit;
    }

    $decoded = json_decode(base64_decode($token), true);
    if ($decoded && isset($decoded['id'])) {
        // Verifica se o token expirou
        if (isset($decoded['exp']) && $decoded['exp'] < time()) {
            http_response_code(401);
            echo json_encode(['error' => 'Token expirado']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT id, nome, email, tipo, ativo FROM usuarios WHERE id = ?");
        $stmt->execute([$decoded['id']]);
        $user = $stmt->fetch();
        if ($user) {
            echo json_encode(['user' => $user]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Usuário não encontrado']);
        }
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Token inválido']);
    }
} elseif ($action === 'logout') {
    echo json_encode(['success' => true]);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Ação inválida']);
}
