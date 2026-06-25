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
    $action = $_POST['action'] ?? '';

    if ($action === 'create' || $action === 'update') {
        $id = !empty($_POST['id']) ? $_POST['id'] : generateUUID();
        $titulo = $_POST['titulo'] ?? '';
        $ordem = (int)($_POST['ordem'] ?? 0);
        $ativo = isset($_POST['ativo']) ? 1 : 0;
        $url_imagem = $_POST['current_url_imagem'] ?? '';

        if (isset($_FILES['imagem']) && $_FILES['imagem']['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES['imagem'];
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $fileName = time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
            $target = "../uploads/carousel/" . $fileName;
            if (move_uploaded_file($file['tmp_name'], $target)) {
                $url_imagem = "uploads/carousel/" . $fileName;
            }
        }

        if ($action === 'create') {
            $stmt = $pdo->prepare("INSERT INTO carousel_images (id, titulo, url_imagem, ordem, ativo) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$id, $titulo, $url_imagem, $ordem, $ativo]);
        } else {
            $stmt = $pdo->prepare("UPDATE carousel_images SET titulo = ?, url_imagem = ?, ordem = ?, ativo = ? WHERE id = ?");
            $stmt->execute([$titulo, $url_imagem, $ordem, $ativo, $id]);
        }
        $message = "Operação realizada com sucesso!";
    } elseif ($action === 'delete') {
        $id = $_POST['id'] ?? '';
        $stmt = $pdo->prepare("DELETE FROM carousel_images WHERE id = ?");
        $stmt->execute([$id]);
        $message = "Imagem removida!";
    }
}

$stmt = $pdo->query("SELECT * FROM carousel_images ORDER BY ordem ASC");
$images = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerenciar Carrossel | Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="bg-gray-900 text-white min-h-screen flex">
    <aside class="w-64 bg-gray-800 border-r border-gray-700 hidden md:flex flex-col">
        <div class="p-6 border-b border-gray-700 text-center"><h1 class="text-xl font-bold text-orange-500">Admin Panel</h1></div>
        <nav class="flex-1 p-4 space-y-2">
            <a href="index.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"><i data-lucide="bar-chart-3" class="w-5 h-5"></i><span>Dashboard</span></a>
            <a href="pizzas.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"><i data-lucide="pizza" class="w-5 h-5"></i><span>Pizzas</span></a>
            <a href="carousel.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors bg-gray-700"><i data-lucide="image" class="w-5 h-5"></i><span>Carrossel</span></a>
            <a href="home_config.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"><i data-lucide="home" class="w-5 h-5"></i><span>Config. Home</span></a>
            <a href="instagram.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"><i data-lucide="instagram" class="w-5 h-5"></i><span>Instagram</span></a>
            <a href="formularios.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"><i data-lucide="users" class="w-5 h-5"></i><span>Formulários</span></a>
            <a href="contratos.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"><i data-lucide="file-text" class="w-5 h-5"></i><span>Contratos</span></a>
            <a href="users.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"><i data-lucide="shield" class="w-5 h-5"></i><span>Usuários</span></a>
        </nav>
    </aside>

    <main class="flex-1 p-8">
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-3xl font-bold">Gerenciar Carrossel</h2>
            <button onclick="document.getElementById('form-modal').classList.remove('hidden')" class="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg flex items-center"><i data-lucide="plus" class="mr-2 w-4 h-4"></i> Nova Imagem</button>
        </div>

        <?php if ($message): ?><div class="bg-green-500/20 border border-green-500 text-green-500 p-4 rounded-lg mb-6"><?php echo $message; ?></div><?php endif; ?>

        <div id="form-modal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div class="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-lg shadow-2xl">
                <div class="p-6 border-b border-gray-700 flex justify-between items-center"><h3 class="text-xl font-bold">Imagem do Carrossel</h3><button onclick="document.getElementById('form-modal').classList.add('hidden')"><i data-lucide="x"></i></button></div>
                <form action="carousel.php" method="POST" enctype="multipart/form-data" class="p-6 space-y-4">
                    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                    <input type="hidden" name="action" id="form-action" value="create">
                    <input type="hidden" name="id" id="form-id">
                    <input type="hidden" name="current_url_imagem" id="form-current-img">
                    <div><label class="block text-sm text-gray-400 mb-1">Título</label><input type="text" name="titulo" id="form-titulo" required class="w-full bg-gray-700 border-gray-600 rounded-lg p-2 text-white"></div>
                    <div class="grid grid-cols-2 gap-4">
                        <div><label class="block text-sm text-gray-400 mb-1">Ordem</label><input type="number" name="ordem" id="form-ordem" value="0" class="w-full bg-gray-700 border-gray-600 rounded-lg p-2 text-white"></div>
                        <div class="flex items-center pt-6"><input type="checkbox" name="ativo" id="form-ativo" checked class="mr-2"><label class="text-sm text-gray-400">Ativo</label></div>
                    </div>
                    <div><label class="block text-sm text-gray-400 mb-1">Imagem</label><input type="file" name="imagem" accept="image/*" class="w-full bg-gray-700 border-gray-600 rounded-lg p-2 text-white"></div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="document.getElementById('form-modal').classList.add('hidden')" class="px-4 py-2 text-gray-400">Cancelar</button>
                        <button type="submit" class="bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-lg font-bold">Salvar</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <?php foreach($images as $img): ?>
                <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex">
                    <div class="w-40 bg-gray-700"><img src="../<?php echo $img['url_imagem']; ?>" class="w-full h-full object-cover"></div>
                    <div class="p-6 flex-1">
                        <h3 class="font-bold mb-1"><?php echo htmlspecialchars($img['titulo']); ?></h3>
                        <p class="text-xs text-gray-400 mb-4">Ordem: <?php echo $img['ordem']; ?> | Status: <?php echo $img['ativo'] ? 'Ativo' : 'Inativo'; ?></p>
                        <div class="flex space-x-4">
                            <button onclick='editImg(<?php echo json_encode($img); ?>)' class="text-blue-400 hover:text-blue-300 text-sm">Editar</button>
                            <form action="carousel.php" method="POST" onsubmit="return confirm('Excluir?')" class="inline"><input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>"><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?php echo $img['id']; ?>"><button type="submit" class="text-red-400 hover:text-red-300 text-sm">Excluir</button></form>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </main>
    <script>
        lucide.createIcons();
        function editImg(img) {
            document.getElementById('form-action').value = 'update';
            document.getElementById('form-id').value = img.id;
            document.getElementById('form-titulo').value = img.titulo;
            document.getElementById('form-ordem').value = img.ordem;
            document.getElementById('form-ativo').checked = img.ativo == 1;
            document.getElementById('form-current-img').value = img.url_imagem;
            document.getElementById('form-modal').classList.remove('hidden');
        }
    </script>
</body>
</html>
