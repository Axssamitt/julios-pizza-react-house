<?php
// Configuration for the database connection
// IMPORTANT: In production, move this file outside the public_html directory
// or ensure it is not accessible via the web.

return [
    'host' => 'localhost',
    'db'   => 'julios92_basedados',
    'user' => 'julios92_admin',
    'pass' => '@Calabresa2024',
    'secret_key' => 'julios_buffet_secret_key_2024',
    // Configure RESEND_API_KEY diretamente no ambiente do servidor.
    'resend_api_key' => '',
    'resend_from' => "Julio's Pizza House <onboarding@resend.dev>",
    'resend_to' => 'juliospizzahouse@gmail.com',
    'allowed_origins' => [
        'https://juliospizzahouse.com.br',
        'https://www.juliospizzahouse.com.br'
    ]
];
?>
