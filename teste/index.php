<?php
require_once 'includes/db.php';

// Fetch Home Config
$stmt = $pdo->query("SELECT * FROM home_config LIMIT 1");
$config = $stmt->fetch();

// Fetch Carousel Images
$stmt = $pdo->query("SELECT * FROM carousel_images WHERE ativo = 1 ORDER BY ordem ASC");
$carousel_images = $stmt->fetchAll();

// Fetch Pizzas (limit to 6 for home)
$stmt = $pdo->query("SELECT * FROM pizzas WHERE ativo = 1 ORDER BY ordem ASC LIMIT 6");
$pizzas = $stmt->fetchAll();

include 'includes/header.php';
?>

<!-- Hero Section -->
<section id="home" class="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
    <div class="container mx-auto px-4">
        <div class="flex flex-col lg:flex-row items-center gap-12">
            <div class="flex-1 text-center lg:text-left">
                <h2 class="text-4xl md:text-6xl lg:text-7xl font-bold mb-6" style="text-align: <?php echo $config['align_titulo_hero'] ?? 'left'; ?>">
                    <span class="bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent">
                        <?php echo nl2br(htmlspecialchars($config['titulo_hero'] ?? "As Melhores Pizzas de Londrina")); ?>
                    </span>
                </h2>
                <p class="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl" style="text-align: <?php echo $config['align_subtitulo_hero'] ?? 'left'; ?>">
                    <?php echo nl2br(htmlspecialchars($config['subtitulo_hero'] ?? "Sabor autêntico para seus eventos. Buffet de pizzas artesanais feitas com ingredientes frescos e muito amor.")); ?>
                </p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="flex items-center justify-center lg:justify-start space-x-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <i data-lucide="map-pin" class="text-orange-400"></i>
                        <span class="text-gray-300"><?php echo htmlspecialchars($config['endereco'] ?? "Londrina-PR"); ?></span>
                    </div>
                    <div class="flex items-center justify-center lg:justify-start space-x-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <i data-lucide="utensils" class="text-orange-400"></i>
                        <span class="text-gray-300">Buffet para Eventos</span>
                    </div>
                </div>
            </div>

            <div class="flex-1 relative w-full max-w-md mx-auto lg:max-w-full">
                <!-- Simple Carousel implementation -->
                <div class="relative rounded-2xl overflow-hidden aspect-square shadow-2xl">
                    <?php if (empty($carousel_images)): ?>
                        <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop" class="w-full h-full object-cover" alt="Pizza">
                    <?php else: ?>
                        <?php foreach($carousel_images as $idx => $img): ?>
                            <div class="carousel-item <?php echo $idx === 0 ? '' : 'hidden'; ?> absolute inset-0 transition-opacity duration-1000">
                                <img src="<?php echo htmlspecialchars($img['url_imagem']); ?>" class="w-full h-full object-cover" alt="<?php echo htmlspecialchars($img['titulo']); ?>">
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Pizza Gallery -->
<section id="pizzas" class="py-20 bg-gray-900">
    <div class="container mx-auto px-4">
        <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold mb-6">
                <span class="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Nosso Cardápio</span>
            </h2>
            <p class="text-gray-400 text-lg max-w-2xl mx-auto">Descubra sabores únicos preparados com ingredientes frescos e receitas tradicionais</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <?php foreach($pizzas as $pizza): ?>
                <div class="bg-gray-800 rounded-lg overflow-hidden shadow-xl hover:transform hover:scale-105 transition-all duration-300">
                    <div class="relative h-64">
                        <img src="<?php echo htmlspecialchars($pizza['imagem_url'] ?? 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=400&fit=crop'); ?>" class="w-full h-full object-cover" alt="<?php echo htmlspecialchars($pizza['nome']); ?>">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-white mb-3"><?php echo htmlspecialchars($pizza['nome']); ?></h3>
                        <p class="text-gray-400 text-sm leading-relaxed"><?php echo htmlspecialchars($pizza['ingredientes']); ?></p>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
        <div class="text-center mt-12">
            <a href="cardapio.php" class="inline-block px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full transition-colors">Ver Cardápio Completo</a>
        </div>
    </div>
</section>

<!-- About Section -->
<section id="about" class="py-20 bg-gray-800">
    <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row items-center gap-12">
            <div class="flex-1">
                <img src="https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&auto=format&fit=crop" class="rounded-2xl shadow-2xl" alt="Sobre Nós">
            </div>
            <div class="flex-1">
                <h2 class="text-4xl font-bold mb-6 text-orange-400">Sobre Nós</h2>
                <p class="text-gray-300 text-lg leading-relaxed mb-6">
                    <?php echo nl2br(htmlspecialchars($config['texto_sobre'] ?? "A Júlio's Pizza House nasceu da paixão por criar momentos inesquecíveis através da gastronomia. Especializados em buffet de pizzas para eventos, levamos até você toda a estrutura necessária para uma experiência autêntica e saborosa.")); ?>
                </p>
            </div>
        </div>
    </div>
</section>

<!-- Contact Form -->
<section id="contact" class="py-20 bg-gray-900">
    <div class="max-w-4xl mx-auto px-4">
        <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">
                <span class="bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent">Solicite seu Orçamento</span>
            </h2>
            <p class="text-lg text-gray-300">Preencha o formulário e receba uma proposta personalizada</p>
        </div>

        <div class="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
            <div class="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 p-6 text-center">
                <h3 class="text-2xl font-bold text-white">Formulário de Orçamento</h3>
            </div>
            <form action="api/submit_contact.php" method="POST" class="p-8 space-y-6">
                <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Nome Completo *</label>
                        <input type="text" name="nome_completo" required class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">CPF *</label>
                        <input type="text" name="cpf" required placeholder="000.000.000-00" class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none">
                    </div>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Endereço Residencial *</label>
                        <input type="text" name="endereco" required class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Endereço do Evento *</label>
                        <input type="text" name="endereco_evento" required class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none">
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Data do Evento *</label>
                        <input type="date" name="data_evento" required class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Horário de Início *</label>
                        <input type="time" name="horario" required class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none">
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Quantidade de Adultos *</label>
                        <input type="number" name="quantidade_adultos" min="1" value="1" required class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Quantidade de Crianças (5-9 anos)</label>
                        <input type="number" name="quantidade_criancas" min="0" value="0" class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Telefone/WhatsApp *</label>
                    <input type="tel" name="telefone" required placeholder="(43) 99999-9999" class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Observações Adicionais</label>
                    <textarea name="observacoes" rows="4" class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none"></textarea>
                </div>
                <button type="submit" class="w-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 hover:from-orange-600 hover:via-red-600 hover:to-orange-700 text-white py-4 rounded-lg text-lg font-bold transition-all shadow-lg">Solicitar Orçamento</button>
            </form>
        </div>
    </div>
</section>

<script>
    // Simple carousel script
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-item');
    if (slides.length > 1) {
        setInterval(() => {
            slides[currentSlide].classList.add('hidden');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.remove('hidden');
        }, 5000);
    }
</script>

<?php include 'includes/footer.php'; ?>
