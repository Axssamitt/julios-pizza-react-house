<?php
require_once '../includes/db.php';

if (!is_logged_in() || $_SESSION['user_tipo'] !== 'admin') {
    // Only full admins can manage users
    redirect('index.php');
}

$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token($_POST['csrf_token'] ?? '')) {
        die("Invalid CSRF token.");
    }
    $action = $_POST['action'] ?? '';
    if ($action === 'create' || $action === 'update') {
        $id = !empty($_POST['id']) ? $_POST['id'] : generateUUID();
        $nome = $_POST['nome'] ?? '';
        $email = $_POST['email'] ?? '';
        $tipo = $_POST['tipo'] ?? 'user';
        $ativo = isset($_POST['ativo']) ? 1 : 0;
        $senha = $_POST['senha'] ?? '';

        if ($action === 'create') {
            $hashed_senha = password_hash($senha, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO usuarios (id, nome, email, senha, tipo, ativo) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id, $nome, $email, $hashed_senha, $tipo, $ativo]);
        } else {
            if (!empty($senha)) {
                $hashed_senha = password_hash($senha, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("UPDATE usuarios SET nome = ?, email = ?, senha = ?, tipo = ?, ativo = ? WHERE id = ?");
                $stmt->execute([$nome, $email, $hashed_senha, $tipo, $ativo, $id]);
            } else {
                $stmt = $pdo->prepare("UPDATE usuarios SET nome = ?, email = ?, tipo = ?, ativo = ? WHERE id = ?");
                $stmt->execute([$nome, $email, $tipo, $ativo, $id]);
            }
        }
        $message = "Usuário salvo!";
    }
}

$usuarios = $pdo->query("SELECT * FROM usuarios ORDER BY created_at DESC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Usuários | Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="bg-gray-900 text-white min-h-screen flex">
    <aside class="w-64 bg-gray-800 border-r border-gray-700 hidden md:flex flex-col">
        <div class="p-6 border-b border-gray-700 text-center"><h1 class="text-xl font-bold text-orange-500">Admin Panel</h1></div>
        <nav class="flex-1 p-4 space-y-2">
            <a href="index.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"><i data-lucide="bar-chart-3" class="w-5 h-5"></i><span>Dashboard</span></a>
            <a href="pizzas.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"><i data-lucide="pizza" class="w-5 h-5"></i><span>Pizzas</span></a>
            <a href="carousel.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"><i data-lucide="image" class="w-5 h-5"></i><span>Carrossel</span></a>
            <a href="home_config.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"><i data-lucide="home" class="w-5 h-5"></i><span>Config. Home</span></a>
            <a href="instagram.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"><i data-lucide="instagram" class="w-5 h-5"></i><span>Instagram</span></a>
            <a href="formularios.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"><i data-lucide="users" class="w-5 h-5"></i><span>Formulários</span></a>
            <a href="contratos.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"><i data-lucide="file-text" class="w-5 h-5"></i><span>Contratos</span></a>
            <a href="users.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors bg-gray-700"><i data-lucide="shield" class="w-5 h-5"></i><span>Usuários</span></a>
        </nav>
    </aside>
    <main class="flex-1 p-8">
        <div class="flex justify-between items-center mb-8"><h2 class="text-3xl font-bold">Gerenciar Usuários</h2><button onclick="document.getElementById('modal').classList.remove('hidden')" class="bg-orange-600 px-4 py-2 rounded-lg">Novo Usuário</button></div>
        <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <table class="w-full text-left">
                <thead class="bg-gray-700 text-gray-300 text-sm uppercase"><tr><th class="p-4">Nome</th><th class="p-4">Email</th><th class="p-4">Tipo</th><th class="p-4">Status</th><th class="p-4">Ações</th></tr></thead>
                <tbody class="divide-y divide-gray-700">
                    <?php foreach($usuarios as $user): ?>
                        <tr>
                            <td class="p-4"><?php echo htmlspecialchars($user['nome']); ?></td>
                            <td class="p-4"><?php echo htmlspecialchars($user['email']); ?></td>
                            <td class="p-4 capitalize"><?php echo $user['tipo']; ?></td>
                            <td class="p-4"><span class="<?php echo $user['ativo'] ? 'text-green-500' : 'text-red-500'; ?>"><?php echo $user['ativo'] ? 'Ativo' : 'Inativo'; ?></span></td>
                            <td class="p-4"><button onclick='editUser(<?php echo json_encode($user); ?>)' class="text-blue-400">Editar</button></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <div id="modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <form method="POST" class="bg-gray-800 p-8 rounded-xl max-w-lg w-full space-y-4">
                <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                <input type="hidden" name="action" id="action" value="create"><input type="hidden" name="id" id="id">
                <div><label class="block text-sm">Nome</label><input type="text" name="nome" id="nome" required class="w-full bg-gray-700 p-2 rounded"></div>
                <div><label class="block text-sm">Email</label><input type="email" name="email" id="email" required class="w-full bg-gray-700 p-2 rounded"></div>
                <div><label class="block text-sm">Senha (deixe em branco se não quiser alterar)</label><input type="password" name="senha" class="w-full bg-gray-700 p-2 rounded"></div>
                <div><label class="block text-sm">Tipo</label><select name="tipo" id="tipo" class="w-full bg-gray-700 p-2 rounded"><option value="admin">Admin</option><option value="user">User</option><option value="restrito">Restrito</option></select></div>
                <div class="flex items-center"><input type="checkbox" name="ativo" id="ativo" checked class="mr-2"><label class="text-sm">Ativo</label></div>
                <div class="flex justify-end space-x-4"><button type="button" onclick="document.getElementById('modal').classList.add('hidden')" class="text-gray-400">Cancelar</button><button type="submit" class="bg-orange-600 px-6 py-2 rounded">Salvar</button></div>
            </form>
        </div>
    </main>
    <script>
        lucide.createIcons();
        function editUser(u) {
            document.getElementById('action').value = 'update';
            document.getElementById('id').value = u.id;
            document.getElementById('nome').value = u.nome;
            document.getElementById('email').value = u.email;
            document.getElementById('tipo').value = u.tipo;
            document.getElementById('ativo').checked = u.ativo == 1;
            document.getElementById('modal').classList.remove('hidden');
        }
    </script>
</body>
</html>
