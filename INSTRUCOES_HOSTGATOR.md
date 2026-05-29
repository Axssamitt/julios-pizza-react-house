# Instruções de Implementação no HostGator

Para colocar seu projeto no ar no HostGator, siga estes passos:

## 1. Banco de Dados
1. Acesse o **cPanel** do seu HostGator.
2. Vá em **Bancos de Dados MySQL** e crie o banco `julios92_basedados`.
3. Crie o usuário `julios92_admin` com a senha `@Calabresa2024`.
4. Adicione o usuário ao banco de dados com **todos os privilégios**.
5. Vá em **phpMyAdmin**, selecione o banco criado e use a aba **Importar** para subir o arquivo `database.sql` (que está na raiz do seu projeto ou na pasta `public/`).

## 2. Preparar os Arquivos
1. No seu computador, abra o terminal na pasta do projeto.
2. Execute o comando:
   ```bash
   npm run build
   ```
3. Isso gerará uma pasta chamada `dist`.

## 3. Upload para o Servidor
1. No cPanel, vá em **Gerenciador de Arquivos**.
2. Navegue até a pasta `public_html` (ou a pasta do seu subdomínio).
3. **Importante:** Copie **todo o conteúdo** de dentro da pasta `dist` (gerada no passo anterior) para dentro da `public_html`.
4. Certifique-se de que o arquivo `.htaccess` foi copiado (ele é essencial para as rotas funcionarem).

## 4. Estrutura de Pastas Final no Servidor
Sua `public_html` deve ficar assim:
```
public_html/
├── api/
│   ├── uploads/
│   ├── auth.php
│   ├── db.php
│   ├── rest.php
│   └── upload.php
├── assets/ (arquivos js e css compilados)
├── .htaccess
├── index.html
├── database.sql (pode apagar após importar)
└── ... outros arquivos
```

## 5. Permissões
Certifique-se de que a pasta `api/uploads/` tenha permissão de escrita (geralmente `755` ou `777`) para que o upload de imagens de pizzas e carrossel funcione corretamente.
