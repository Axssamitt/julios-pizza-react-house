<?php
require_once '../includes/db.php';

if (!is_logged_in()) {
    redirect('../login.php');
}

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token($_POST['csrf_token'] ?? '')) {
        die("Invalid CSRF token.");
    }
    $titulo_hero = $_POST['titulo_hero'] ?? '';
    $subtitulo_hero = $_POST['subtitulo_hero'] ?? '';
    $align_titulo_hero = $_POST['align_titulo_hero'] ?? 'left';
    $align_subtitulo_hero = $_POST['align_subtitulo_hero'] ?? 'left';
    $texto_sobre = $_POST['texto_sobre'] ?? '';
    $nome_empresa = $_POST['nome_empresa'] ?? '';
    $telefone = $_POST['telefone'] ?? '';
    $endereco = $_POST['endereco'] ?? '';
    $instagram_url = $_POST['instagram_url'] ?? '';
    $facebook_url = $_POST['facebook_url'] ?? '';

    $stmt = $pdo->prepare("UPDATE home_config SET
        titulo_hero = ?,
        subtitulo_hero = ?,
        align_titulo_hero = ?,
        align_subtitulo_hero = ?,
        texto_sobre = ?,
        nome_empresa = ?,
        telefone = ?,
        endereco = ?,
        instagram_url = ?,
        facebook_url = ?,
        atualizado_por = ?
    ");
    $stmt->execute([$titulo_hero, $subtitulo_hero, $align_titulo_hero, $align_subtitulo_hero, $texto_sobre, $nome_empresa, $telefone, $endereco, $instagram_url, $facebook_url, $_SESSION['user_id']]);
    $message = "Configurações salvas!";
}

$stmt = $pdo->query("SELECT * FROM home_config LIMIT 1");
$config = $stmt->fetch();
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Configuração Home | Admin</title>
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
            <a href="home_config.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors bg-gray-700"><i data-lucide="home" class="w-5 h-5"></i><span>Config. Home</span></a>
            <a href="instagram.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"><i data-lucide="instagram" class="w-5 h-5"></i><span>Instagram</span></a>
            <a href="formularios.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"><i data-lucide="users" class="w-5 h-5"></i><span>Formulários</span></a>
            <a href="contratos.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"><i data-lucide="file-text" class="w-5 h-5"></i><span>Contratos</span></a>
            <a href="users.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"><i data-lucide="shield" class="w-5 h-5"></i><span>Usuários</span></a>
        </nav>
    </aside>

    <main class="flex-1 p-8 overflow-y-auto">
        <h2 class="text-3xl font-bold mb-8">Configuração da Home</h2>
        <?php if ($message): ?><div class="bg-green-500/20 border border-green-500 text-green-500 p-4 rounded-lg mb-6"><?php echo $message; ?></div><?php endif; ?>

        <form action="home_config.php" method="POST" class="bg-gray-800 border border-gray-700 rounded-xl p-8 space-y-6 max-w-4xl">
            <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="col-span-2">
                    <label class="block text-sm text-gray-400 mb-1">Título Hero</label>
                    <input type="text" name="titulo_hero" value="<?php echo htmlspecialchars($config['titulo_hero'] ?? ''); ?>" class="w-full bg-gray-700 border-gray-600 rounded-lg p-2 text-white">
                </div>
                <div>
                    <label class="block text-sm text-gray-400 mb-1">Alinhamento Título</label>
                    <select name="align_titulo_hero" class="w-full bg-gray-700 border-gray-600 rounded-lg p-2 text-white">
                        <option value="left" <?php echo ($config['align_titulo_hero'] ?? '') == 'left' ? 'selected' : ''; ?>>Esquerda</option>
                        <option value="center" <?php echo ($config['align_titulo_hero'] ?? '') == 'center' ? 'selected' : ''; ?>>Centralizado</option>
                        <option value="right" <?php echo ($config['align_titulo_hero'] ?? '') == 'right' ? 'selected' : ''; ?>>Direita</option>
                    </select>
                </div>
                <div class="col-span-2">
                    <label class="block text-sm text-gray-400 mb-1">Subtítulo Hero</label>
                    <textarea name="subtitulo_hero" rows="3" class="w-full bg-gray-700 border-gray-600 rounded-lg p-2 text-white"><?php echo htmlspecialchars($config['subtitulo_hero'] ?? ''); ?></textarea>
                </div>
                <div class="col-span-2">
                    <label class="block text-sm text-gray-400 mb-1">Texto Sobre Nós</label>
                    <textarea name="texto_sobre" rows="5" class="w-full bg-gray-700 border-gray-600 rounded-lg p-2 text-white"><?php echo htmlspecialchars($config['texto_sobre'] ?? ''); ?></textarea>
                </div>
                <div>
                    <label class="block text-sm text-gray-400 mb-1">Telefone</label>
                    <input type="text" name="telefone" value="<?php echo htmlspecialchars($config['telefone'] ?? ''); ?>" class="w-full bg-gray-700 border-gray-600 rounded-lg p-2 text-white">
                </div>
                <div>
                    <label class="block text-sm text-gray-400 mb-1">Endereço</label>
                    <input type="text" name="endereco" value="<?php echo htmlspecialchars($config['endereco'] ?? ''); ?>" class="w-full bg-gray-700 border-gray-600 rounded-lg p-2 text-white">
                </div>
                <div>
                    <label class="block text-sm text-gray-400 mb-1">Instagram URL</label>
                    <input type="text" name="instagram_url" value="<?php echo htmlspecialchars($config['instagram_url'] ?? ''); ?>" class="w-full bg-gray-700 border-gray-600 rounded-lg p-2 text-white">
                </div>
                <div>
                    <label class="block text-sm text-gray-400 mb-1">Facebook URL</label>
                    <input type="text" name="facebook_url" value="<?php echo htmlspecialchars($config['facebook_url'] ?? ''); ?>" class="w-full bg-gray-700 border-gray-600 rounded-lg p-2 text-white">
                </div>
            </div>
            <div class="flex justify-end"><button type="submit" class="bg-orange-600 hover:bg-orange-700 px-8 py-3 rounded-lg font-bold">Salvar Alterações</button></div>
        </form>
    </main>
    <script>lucide.createIcons();</script>
</body>
</html>
