<?php
require_once '../includes/db.php';

if (!is_logged_in()) redirect('../login.php');

$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token($_POST['csrf_token'] ?? '')) {
        die("Invalid CSRF token.");
    }
    if (isset($_POST['action']) && $_POST['action'] === 'delete') {
        $stmt = $pdo->prepare("DELETE FROM formularios_contato WHERE id = ?");
        $stmt->execute([$_POST['id']]);
        $message = "Formulário removido!";
    } elseif (isset($_POST['action']) && $_POST['action'] === 'update_status') {
        $stmt = $pdo->prepare("UPDATE formularios_contato SET status = ? WHERE id = ?");
        $stmt->execute([$_POST['status'], $_POST['id']]);
        $message = "Status atualizado!";
    }
}

$formularios = $pdo->query("SELECT * FROM formularios_contato ORDER BY created_at DESC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Formulários | Admin</title>
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
            <a href="formularios.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors bg-gray-700"><i data-lucide="users" class="w-5 h-5"></i><span>Formulários</span></a>
            <a href="contratos.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"><i data-lucide="file-text" class="w-5 h-5"></i><span>Contratos</span></a>
            <a href="users.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"><i data-lucide="shield" class="w-5 h-5"></i><span>Usuários</span></a>
        </nav>
    </aside>
    <main class="flex-1 p-8">
        <h2 class="text-3xl font-bold mb-8">Solicitações de Orçamento</h2>
        <div class="space-y-6">
            <?php foreach($formularios as $form): ?>
                <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h3 class="text-xl font-bold"><?php echo htmlspecialchars($form['nome_completo']); ?></h3>
                            <p class="text-gray-400 text-sm"><?php echo date('d/m/Y H:i', strtotime($form['created_at'])); ?></p>
                        </div>
                        <div class="flex items-center space-x-4">
                            <form method="POST" class="flex items-center space-x-2">
                                <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                                <input type="hidden" name="action" value="update_status"><input type="hidden" name="id" value="<?php echo $form['id']; ?>">
                                <select name="status" onchange="this.form.submit()" class="bg-gray-700 text-sm rounded p-1">
                                    <option value="pendente" <?php echo $form['status'] == 'pendente' ? 'selected' : ''; ?>>Pendente</option>
                                    <option value="em_analise" <?php echo $form['status'] == 'em_analise' ? 'selected' : ''; ?>>Em Análise</option>
                                    <option value="aprovado" <?php echo $form['status'] == 'aprovado' ? 'selected' : ''; ?>>Aprovado</option>
                                    <option value="rejeitado" <?php echo $form['status'] == 'rejeitado' ? 'selected' : ''; ?>>Rejeitado</option>
                                </select>
                            </form>
                            <form method="POST" onsubmit="return confirm('Excluir?')">
                                <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                                <input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?php echo $form['id']; ?>">
                                <button type="submit" class="text-red-400"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
                            </form>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><p class="text-gray-400">Telefone</p><p><?php echo htmlspecialchars($form['telefone']); ?></p></div>
                        <div><p class="text-gray-400">Data Evento</p><p><?php echo date('d/m/Y', strtotime($form['data_evento'])); ?> às <?php echo $form['horario']; ?></p></div>
                        <div><p class="text-gray-400">Pessoas</p><p><?php echo $form['quantidade_adultos']; ?> Adultos, <?php echo $form['quantidade_criancas']; ?> Crianças</p></div>
                        <div><p class="text-gray-400">CPF</p><p><?php echo htmlspecialchars($form['cpf']); ?></p></div>
                    </div>
                    <div class="mt-4"><p class="text-gray-400 text-sm">Endereço Evento</p><p class="text-sm"><?php echo htmlspecialchars($form['endereco_evento']); ?></p></div>
                    <?php if($form['observacoes']): ?>
                        <div class="mt-4 bg-gray-700/50 p-3 rounded text-sm italic">"<?php echo htmlspecialchars($form['observacoes']); ?>"</div>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>
    </main>
    <script>lucide.createIcons();</script>
</body>
</html>
