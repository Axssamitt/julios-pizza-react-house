<?php
require_once '../includes/db.php';

if (!is_logged_in()) redirect('../login.php');

$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token($_POST['csrf_token'] ?? '')) {
        die("Invalid CSRF token.");
    }
    $action = $_POST['action'] ?? '';
    if ($action === 'create' || $action === 'update') {
        $id = !empty($_POST['id']) ? $_POST['id'] : generateUUID();
        $titulo = $_POST['titulo'] ?? '';
        $url_imagem = $_POST['url_imagem'] ?? '';
        $url_post = $_POST['url_post'] ?? '';
        $ordem = (int)($_POST['ordem'] ?? 0);
        $ativo = isset($_POST['ativo']) ? 1 : 0;

        if ($action === 'create') {
            $stmt = $pdo->prepare("INSERT INTO instagram_posts (id, titulo, url_imagem, url_post, ordem, ativo) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id, $titulo, $url_imagem, $url_post, $ordem, $ativo]);
        } else {
            $stmt = $pdo->prepare("UPDATE instagram_posts SET titulo = ?, url_imagem = ?, url_post = ?, ordem = ?, ativo = ? WHERE id = ?");
            $stmt->execute([$titulo, $url_imagem, $url_post, $ordem, $ativo, $id]);
        }
        $message = "Salvo com sucesso!";
    } elseif ($action === 'delete') {
        $stmt = $pdo->prepare("DELETE FROM instagram_posts WHERE id = ?");
        $stmt->execute([$_POST['id']]);
    }
}

$posts = $pdo->query("SELECT * FROM instagram_posts ORDER BY ordem ASC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Instagram | Admin</title>
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
            <a href="instagram.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors bg-gray-700"><i data-lucide="instagram" class="w-5 h-5"></i><span>Instagram</span></a>
            <a href="formularios.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"><i data-lucide="users" class="w-5 h-5"></i><span>Formulários</span></a>
            <a href="contratos.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"><i data-lucide="file-text" class="w-5 h-5"></i><span>Contratos</span></a>
            <a href="users.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"><i data-lucide="shield" class="w-5 h-5"></i><span>Usuários</span></a>
        </nav>
    </aside>
    <main class="flex-1 p-8">
        <div class="flex justify-between items-center mb-8"><h2 class="text-3xl font-bold">Feed Instagram</h2><button onclick="document.getElementById('modal').classList.remove('hidden')" class="bg-orange-600 px-4 py-2 rounded-lg">+ Novo Post</button></div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <?php foreach($posts as $post): ?>
                <div class="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden p-4">
                    <img src="<?php echo htmlspecialchars($post['url_imagem']); ?>" class="w-full aspect-square object-cover rounded mb-4">
                    <h3 class="font-bold mb-2"><?php echo htmlspecialchars($post['titulo']); ?></h3>
                    <div class="flex justify-between"><button onclick='editPost(<?php echo json_encode($post); ?>)' class="text-blue-400">Editar</button><form method="POST"><input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>"><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?php echo $post['id']; ?>"><button type="submit" class="text-red-400">Excluir</button></form></div>
                </div>
            <?php endforeach; ?>
        </div>
        <div id="modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <form method="POST" class="bg-gray-800 p-8 rounded-xl max-w-lg w-full space-y-4">
                <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                <input type="hidden" name="action" id="action" value="create"><input type="hidden" name="id" id="id">
                <div><label class="block text-sm text-gray-400">Título</label><input type="text" name="titulo" id="titulo" required class="w-full bg-gray-700 p-2 rounded"></div>
                <div><label class="block text-sm text-gray-400">URL Imagem</label><input type="text" name="url_imagem" id="url_imagem" required class="w-full bg-gray-700 p-2 rounded"></div>
                <div><label class="block text-sm text-gray-400">URL Post</label><input type="text" name="url_post" id="url_post" required class="w-full bg-gray-700 p-2 rounded"></div>
                <div class="flex justify-end space-x-4"><button type="button" onclick="document.getElementById('modal').classList.add('hidden')" class="text-gray-400">Cancelar</button><button type="submit" class="bg-orange-600 px-6 py-2 rounded">Salvar</button></div>
            </form>
        </div>
    </main>
    <script>
        lucide.createIcons();
        function editPost(post) {
            document.getElementById('action').value = 'update';
            document.getElementById('id').value = post.id;
            document.getElementById('titulo').value = post.titulo;
            document.getElementById('url_imagem').value = post.url_imagem;
            document.getElementById('url_post').value = post.url_post;
            document.getElementById('modal').classList.remove('hidden');
        }
    </script>
</body>
</html>
