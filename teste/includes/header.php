<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Julios Pizza House - Teste PHP</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-gray-900 text-white min-h-screen">
    <header class="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-orange-500/20">
        <div class="container mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
                <!-- Logo -->
                <div class="flex items-center space-x-4">
                    <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-500">
                        <img
                            src="https://storage.googleapis.com/wzukusers/user-34847409/images/5cf9a50e698b6eDiLZd7/logoo_d200.png"
                            alt="Júlio's Pizza House Logo"
                            className="w-full h-full object-cover"
                        >
                    </div>
                    <div>
                        <h1 class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                            Júlio's Pizza House
                        </h1>
                        <p class="text-orange-400 text-sm">O sabor vai até você</p>
                    </div>
                </div>

                <!-- Desktop Navigation -->
                <nav class="hidden lg:flex items-center space-x-8">
                    <a href="index.php#home" class="text-gray-300 hover:text-orange-400 transition-colors font-medium">INÍCIO</a>
                    <a href="index.php#about" class="text-gray-300 hover:text-orange-400 transition-colors font-medium">SOBRE NÓS</a>
                    <a href="cardapio.php" class="text-gray-300 hover:text-orange-400 transition-colors font-medium">CARDÁPIO</a>
                    <a href="index.php#instagram" class="text-gray-300 hover:text-orange-400 transition-colors font-medium">INSTAGRAM</a>
                    <a href="index.php#contact" class="text-gray-300 hover:text-orange-400 transition-colors font-medium">CONTATO</a>
                    <a href="login.php" class="bg-orange-500/20 px-3 py-1 rounded-md border border-orange-500/50 text-gray-300 hover:text-orange-400 transition-colors font-medium">ADMIN</a>
                </nav>

                <!-- Mobile Menu Button (Placeholder for simplicity, can be improved with JS) -->
                <button class="lg:hidden text-white hover:text-orange-400" id="mobile-menu-button">
                    <i data-lucide="menu"></i>
                </button>
            </div>
        </div>
    </header>
    <main class="pt-24">
