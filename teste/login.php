<?php
require_once 'includes/db.php';

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ? AND ativo = 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['senha'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_nome'] = $user['nome'];
        $_SESSION['user_tipo'] = $user['tipo'];
        redirect('admin/index.php');
    } else {
        $error = 'Credenciais inválidas ou conta inativa.';
    }
}

include 'includes/header.php';
?>

<section class="py-20 bg-gray-900 min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full px-4">
        <div class="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
            <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-center">
                <h2 class="text-2xl font-bold text-white">Acesso Administrativo</h2>
            </div>
            <form action="login.php" method="POST" class="p-8 space-y-6">
                <?php if ($error): ?>
                    <div class="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded text-sm">
                        <?php echo $error; ?>
                    </div>
                <?php endif; ?>

                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">E-mail</label>
                    <input type="email" name="email" required class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                    <input type="password" name="password" required class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none">
                </div>

                <button type="submit" class="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-bold transition-all">Entrar</button>
            </form>
        </div>
        <div class="text-center mt-6">
            <a href="index.php" class="text-gray-400 hover:text-orange-400 text-sm">Voltar para o site</a>
        </div>
    </div>
</section>

<?php include 'includes/footer.php'; ?>
