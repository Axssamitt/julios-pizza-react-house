<?php
require_once '../includes/db.php';

if (!is_logged_in()) {
    redirect('../login.php');
}

$page_title = "Dashboard - Admin";
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $page_title; ?> | Júlio's Pizza House</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-gray-900 text-white min-h-screen flex">

    <!-- Sidebar -->
    <aside class="w-64 bg-gray-800 border-r border-gray-700 hidden md:flex flex-col">
        <div class="p-6 border-b border-gray-700 text-center">
            <h1 class="text-xl font-bold text-orange-500">Admin Panel</h1>
        </div>
        <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
            <a href="index.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors bg-gray-700">
                <i data-lucide="bar-chart-3" class="w-5 h-5"></i>
                <span>Dashboard</span>
            </a>
            <a href="pizzas.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors">
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
        <div class="p-4 border-t border-gray-700">
            <a href="logout.php" class="flex items-center space-x-3 p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                <i data-lucide="log-out" class="w-5 h-5"></i>
                <span>Sair</span>
            </a>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-h-screen">
        <header class="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
            <button class="md:hidden text-white">
                <i data-lucide="menu"></i>
            </button>
            <div class="flex items-center space-x-4">
                <div class="text-right hidden sm:block">
                    <p class="text-sm font-medium"><?php echo htmlspecialchars($_SESSION['user_nome']); ?></p>
                    <p class="text-xs text-gray-400"><?php echo htmlspecialchars($_SESSION['user_email']); ?></p>
                </div>
                <div class="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center font-bold">
                    <?php echo substr($_SESSION['user_nome'], 0, 1); ?>
                </div>
            </div>
        </header>

        <section class="p-6 md:p-8 flex-1">
            <h2 class="text-3xl font-bold mb-8">Bem-vindo ao Painel, <?php echo explode(' ', $_SESSION['user_nome'])[0]; ?>!</h2>

            <!-- Quick Stats -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                        <div class="p-2 bg-orange-500/20 rounded-lg text-orange-500">
                            <i data-lucide="users"></i>
                        </div>
                    </div>
                    <?php
                    $stmt = $pdo->query("SELECT COUNT(*) FROM formularios_contato");
                    $count = $stmt->fetchColumn();
                    ?>
                    <h3 class="text-gray-400 text-sm font-medium">Contatos</h3>
                    <p class="text-2xl font-bold"><?php echo $count; ?></p>
                </div>
                <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                        <div class="p-2 bg-green-500/20 rounded-lg text-green-500">
                            <i data-lucide="pizza"></i>
                        </div>
                    </div>
                    <?php
                    $stmt = $pdo->query("SELECT COUNT(*) FROM pizzas");
                    $count = $stmt->fetchColumn();
                    ?>
                    <h3 class="text-gray-400 text-sm font-medium">Sabores</h3>
                    <p class="text-2xl font-bold"><?php echo $count; ?></p>
                </div>
                <!-- Add more stats as needed -->
            </div>
        </section>
    </main>

    <script>
        lucide.createIcons();
    </script>
</body>
</html>
