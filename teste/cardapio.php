<?php
require_once 'includes/db.php';

// Fetch all pizzas
$stmt = $pdo->query("SELECT * FROM pizzas WHERE ativo = 1 ORDER BY tipo DESC, ordem ASC");
$pizzas = $stmt->fetchAll();

$salgadas = array_filter($pizzas, function($p) { return $p['tipo'] === 'salgada'; });
$doces = array_filter($pizzas, function($p) { return $p['tipo'] === 'doce'; });

include 'includes/header.php';
?>

<section class="py-20 bg-gray-900 min-h-screen">
    <div class="container mx-auto px-4">
        <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold mb-6">
                <span class="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Nosso Cardápio Completo</span>
            </h2>
            <p class="text-gray-400 text-lg max-w-2xl mx-auto">Explore todos os nossos sabores artesanais</p>
        </div>

        <?php if (!empty($salgadas)): ?>
            <div class="mb-20">
                <h3 class="text-3xl font-bold text-center mb-12 text-orange-400">Pizzas Salgadas</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    <?php foreach($salgadas as $pizza): ?>
                        <div class="bg-gray-800 rounded-lg overflow-hidden shadow-xl border border-gray-700">
                            <div class="h-48 overflow-hidden">
                                <img src="<?php echo htmlspecialchars($pizza['imagem_url'] ?? 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=400&fit=crop'); ?>" class="w-full h-full object-cover transition-transform hover:scale-110 duration-500" alt="<?php echo htmlspecialchars($pizza['nome']); ?>">
                            </div>
                            <div class="p-6">
                                <h4 class="text-xl font-bold text-white mb-2"><?php echo htmlspecialchars($pizza['nome']); ?></h4>
                                <p class="text-gray-400 text-sm"><?php echo htmlspecialchars($pizza['ingredientes']); ?></p>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endif; ?>

        <?php if (!empty($doces)): ?>
            <div>
                <h3 class="text-3xl font-bold text-center mb-12 text-pink-400">Pizzas Doces</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    <?php foreach($doces as $pizza): ?>
                        <div class="bg-gray-800 rounded-lg overflow-hidden shadow-xl border border-gray-700">
                            <div class="h-48 overflow-hidden">
                                <img src="<?php echo htmlspecialchars($pizza['imagem_url'] ?? 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=400&h=400&fit=crop'); ?>" class="w-full h-full object-cover transition-transform hover:scale-110 duration-500" alt="<?php echo htmlspecialchars($pizza['nome']); ?>">
                            </div>
                            <div class="p-6">
                                <h4 class="text-xl font-bold text-white mb-2"><?php echo htmlspecialchars($pizza['nome']); ?></h4>
                                <p class="text-gray-400 text-sm"><?php echo htmlspecialchars($pizza['ingredientes']); ?></p>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endif; ?>
    </div>
</section>

<?php include 'includes/footer.php'; ?>
