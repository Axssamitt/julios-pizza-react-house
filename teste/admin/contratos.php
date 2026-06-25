<?php
require_once '../includes/db.php';

if (!is_logged_in()) redirect('../login.php');

// Simple contracts view
$stmt = $pdo->query("
    SELECT f.*,
           (SELECT COUNT(*) FROM contrato_parcelamentos WHERE formulario_id = f.id) as total_parcelas
    FROM formularios_contato f
    WHERE f.status = 'aprovado'
    ORDER BY f.data_evento ASC
");
$contratos = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Contratos | Admin</title>
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
            <a href="contratos.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors bg-gray-700"><i data-lucide="file-text" class="w-5 h-5"></i><span>Contratos</span></a>
            <a href="users.php" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"><i data-lucide="shield" class="w-5 h-5"></i><span>Usuários</span></a>
        </nav>
    </aside>
    <main class="flex-1 p-8">
        <h2 class="text-3xl font-bold mb-8">Gestão de Contratos</h2>
        <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <table class="w-full text-left">
                <thead class="bg-gray-700 text-gray-300 text-sm uppercase"><tr><th class="p-4">Cliente</th><th class="p-4">Data Evento</th><th class="p-4">Valor Total</th><th class="p-4">Parcelas</th><th class="p-4">Ações</th></tr></thead>
                <tbody class="divide-y divide-gray-700">
                    <?php foreach($contratos as $c): ?>
                        <tr>
                            <td class="p-4 font-medium"><?php echo htmlspecialchars($c['nome_completo']); ?></td>
                            <td class="p-4"><?php echo date('d/m/Y', strtotime($c['data_evento'])); ?></td>
                            <td class="p-4 text-orange-400 font-bold">R$ <?php echo number_format($c['valor_total'] ?? 0, 2, ',', '.'); ?></td>
                            <td class="p-4"><?php echo $c['total_parcelas']; ?></td>
                            <td class="p-4"><button class="bg-orange-600/20 text-orange-400 px-3 py-1 rounded border border-orange-600/50 hover:bg-orange-600 hover:text-white transition-colors">Detalhes</button></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <?php if(empty($contratos)): ?>
                <div class="p-8 text-center text-gray-500">Nenhum contrato aprovado no momento.</div>
            <?php endif; ?>
        </div>
    </main>
    <script>lucide.createIcons();</script>
</body>
</html>
