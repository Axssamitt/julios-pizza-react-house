<?php
require_once '../includes/db.php';

if (!is_logged_in()) {
    redirect('../login.php');
}

$message = '';
$error = '';

// Handle Actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token($_POST['csrf_token'] ?? '')) {
        die("Invalid CSRF token.");
    }
    $action = $_POST['action'] ?? '';

    if ($action === 'create' || $action === 'update') {
        $id = !empty($_POST['id']) ? $_POST['id'] : generateUUID();
        $nome = $_POST['nome'] ?? '';
        $ingredientes = $_POST['ingredientes'] ?? '';
        $tipo = $_POST['tipo'] ?? 'salgada';
        $ordem = (int)($_POST['ordem'] ?? 0);
        $ativo = isset($_POST['ativo']) ? 1 : 0;
        $imagem_url = $_POST['current_imagem_url'] ?? '';

        // Handle Image Upload
        if (isset($_FILES['imagem']) && $_FILES['imagem']['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES['imagem'];
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $allowed = ['jpg', 'jpeg', 'png', 'webp'];

            if (in_array($ext, $allowed)) {
                $fileName = time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                $target = "../uploads/pizzas/" . $fileName;
                if (move_uploaded_file($file['tmp_name'], $target)) {
                    $imagem_url = "uploads/pizzas/" . $fileName;
                }
            }
        }

        if ($action === 'create') {
            $stmt = $pdo->prepare("INSERT INTO pizzas (id, nome, ingredientes, tipo, ordem, ativo, imagem_url) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id, $nome, $ingredientes, $tipo, $ordem, $ativo, $imagem_url]);
            $message = "Pizza criada com sucesso!";
        } else {
            $stmt = $pdo->prepare("UPDATE pizzas SET nome = ?, ingredientes = ?, tipo = ?, ordem = ?, ativo = ?, imagem_url = ? WHERE id = ?");
            $stmt->execute([$nome, $ingredientes, $tipo, $ordem, $ativo, $imagem_url, $id]);
            $message = "Pizza atualizada com sucesso!";
        }
    } elseif ($action === 'delete') {
        $id = $_POST['id'] ?? '';
        $stmt = $pdo->prepare("DELETE FROM pizzas WHERE id = ?");
        $stmt->execute([$id]);
        $message = "Pizza removida com sucesso!";
    }
}

$stmt = $pdo->query("SELECT * FROM pizzas ORDER BY ordem ASC");
$pizzas = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerenciar Pizzas | Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="bg-gray-900 text-white min-h-screen flex">

    <!-- Sidebar (Same as index.php) -->
    <aside class="w-64 bg-gray-800 border-r border-gray-700 hidden md:flex flex-col">
        <div class="p-6 border-b border-gray-700 text-center">
            <h1 class="text-xl font-bold text-orange-500">Admin Panel</h1>
        </div>
        <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
            <a href="index.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors">
                <i data-lucide="bar-chart-3" class="w-5 h-5"></i>
                <span>Dashboard</span>
            </a>
            <a href="pizzas.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors bg-gray-700">
                <i data-lucide="pizza" class="w-5 h-5"></i>
                <span>Pizzas</span>
            </a>
            <a href="carousel.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors">
                <i data-lucide="image" class="w-5 h-5"></i>
                <span>Carrossel</span>
            </a>
            <a href="home_config.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors">
                <i data-lucide="home" class="w-5 h-5"></i>
                <span>Config. Home</span>
            </a>
            <a href="instagram.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors">
                <i data-lucide="instagram" class="w-5 h-5"></i>
                <span>Instagram</span>
            </a>
            <a href="formularios.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors">
                <i data-lucide="users" class="w-5 h-5"></i>
                <span>Formulários</span>
            </a>
            <a href="contratos.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors">
                <i data-lucide="file-text" class="w-5 h-5"></i>
                <span>Contratos</span>
            </a>
            <a href="users.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors">
                <i data-lucide="shield" class="w-5 h-5"></i>
                <span>Usuários</span>
            </a>
        </nav>
    </aside>

    <main class="flex-1 p-8">
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-3xl font-bold">Gerenciar Pizzas</h2>
            <button onclick="toggleForm('new')" class="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg flex items-center">
                <i data-lucide="plus" class="mr-2 w-4 h-4"></i> Nova Pizza
            </button>
        </div>

        <?php if ($message): ?>
            <div class="bg-green-500/20 border border-green-500 text-green-500 p-4 rounded-lg mb-6"><?php echo $message; ?></div>
        <?php endif; ?>

        <!-- Form Modal (Simplified) -->
        <div id="pizza-form" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div class="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl overflow-hidden shadow-2xl">
                <div class="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h3 id="form-title" class="text-xl font-bold">Nova Pizza</h3>
                    <button onclick="toggleForm()" class="text-gray-400 hover:text-white"><i data-lucide="x"></i></button>
                </div>
                <form action="pizzas.php" method="POST" enctype="multipart/form-data" class="p-6 space-y-4">
                    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                    <input type="hidden" name="action" id="form-action" value="create">
                    <input type="hidden" name="id" id="form-id">
                    <input type="hidden" name="current_imagem_url" id="form-current-img">

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm text-gray-400 mb-1">Nome</label>
                            <input type="text" name="nome" id="form-nome" required class="w-full bg-gray-700 border-gray-600 rounded-lg p-2 text-white">
                        </div>
                        <div>
                            <label class="block text-sm text-gray-400 mb-1">Tipo</label>
                            <select name="tipo" id="form-tipo" class="w-full bg-gray-700 border-gray-600 rounded-lg p-2 text-white">
                                <option value="salgada">Salgada</option>
                                <option value="doce">Doce</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-400 mb-1">Ingredientes</label>
                        <textarea name="ingredientes" id="form-ingredientes" rows="3" required class="w-full bg-gray-700 border-gray-600 rounded-lg p-2 text-white"></textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm text-gray-400 mb-1">Ordem</label>
                            <input type="number" name="ordem" id="form-ordem" value="0" class="w-full bg-gray-700 border-gray-600 rounded-lg p-2 text-white">
                        </div>
                        <div class="flex items-center pt-6">
                            <input type="checkbox" name="ativo" id="form-ativo" checked class="mr-2">
                            <label class="text-sm text-gray-400">Ativo</label>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-400 mb-1">Imagem</label>
                        <input type="file" name="imagem" accept="image/*" class="w-full bg-gray-700 border-gray-600 rounded-lg p-2 text-white">
                        <div id="img-preview" class="mt-2 hidden">
                            <img src="" class="h-20 w-20 object-cover rounded border border-gray-600">
                        </div>
                    </div>

                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="toggleForm()" class="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
                        <button type="submit" class="bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-lg font-bold">Salvar</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <?php foreach($pizzas as $pizza): ?>
                <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <div class="h-40 bg-gray-700 relative">
                        <?php if ($pizza['imagem_url']): ?>
                            <img src="../<?php echo $pizza['imagem_url']; ?>" class="w-full h-full object-cover">
                        <?php endif; ?>
                        <div class="absolute top-2 right-2">
                            <span class="<?php echo $pizza['ativo'] ? 'bg-green-600' : 'bg-red-600'; ?> text-xs px-2 py-1 rounded-full font-bold">
                                <?php echo $pizza['ativo'] ? 'Ativo' : 'Inativo'; ?>
                            </span>
                        </div>
                    </div>
                    <div class="p-6">
                        <h3 class="font-bold text-lg mb-1"><?php echo htmlspecialchars($pizza['nome']); ?></h3>
                        <p class="text-xs text-orange-500 font-bold uppercase mb-2"><?php echo $pizza['tipo']; ?> | Ordem: <?php echo $pizza['ordem']; ?></p>
                        <p class="text-gray-400 text-sm line-clamp-2 mb-4"><?php echo htmlspecialchars($pizza['ingredientes']); ?></p>

                        <div class="flex justify-between items-center">
                            <button onclick='editPizza(<?php echo json_encode($pizza); ?>)' class="text-blue-400 hover:text-blue-300 text-sm flex items-center">
                                <i data-lucide="edit-2" class="w-4 h-4 mr-1"></i> Editar
                            </button>
                            <form action="pizzas.php" method="POST" onsubmit="return confirm('Tem certeza?')" class="inline">
                                <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?php echo $pizza['id']; ?>">
                                <button type="submit" class="text-red-400 hover:text-red-300 text-sm flex items-center">
                                    <i data-lucide="trash" class="w-4 h-4 mr-1"></i> Excluir
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </main>

    <script>
        lucide.createIcons();
        function toggleForm(type) {
            const modal = document.getElementById('pizza-form');
            if (type === 'new') {
                document.getElementById('form-action').value = 'create';
                document.getElementById('form-title').innerText = 'Nova Pizza';
                document.getElementById('form-id').value = '';
                document.getElementById('form-nome').value = '';
                document.getElementById('form-ingredientes').value = '';
                document.getElementById('form-tipo').value = 'salgada';
                document.getElementById('form-ordem').value = '0';
                document.getElementById('form-ativo').checked = true;
                document.getElementById('form-current-img').value = '';
                document.getElementById('img-preview').classList.add('hidden');
            }
            modal.classList.toggle('hidden');
        }

        function editPizza(pizza) {
            document.getElementById('form-action').value = 'update';
            document.getElementById('form-title').innerText = 'Editar Pizza';
            document.getElementById('form-id').value = pizza.id;
            document.getElementById('form-nome').value = pizza.nome;
            document.getElementById('form-ingredientes').value = pizza.ingredientes;
            document.getElementById('form-tipo').value = pizza.tipo;
            document.getElementById('form-ordem').value = pizza.ordem;
            document.getElementById('form-ativo').checked = pizza.ativo == 1;
            document.getElementById('form-current-img').value = pizza.imagem_url || '';

            if (pizza.imagem_url) {
                const preview = document.getElementById('img-preview');
                preview.querySelector('img').src = '../' + pizza.imagem_url;
                preview.classList.remove('hidden');
            } else {
                document.getElementById('img-preview').classList.add('hidden');
            }

            document.getElementById('pizza-form').classList.remove('hidden');
        }
    </script>
</body>
</html>
