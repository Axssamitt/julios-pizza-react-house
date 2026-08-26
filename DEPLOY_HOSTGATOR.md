# Implantação no HostGator — juliospizzahouse.com.br (PHP + MySQL)

O frontend (React/Vite) não muda. Todas as chamadas `supabase.*` passam pelo
adaptador em `src/integrations/api/client.ts`, que chama a API PHP em `./api`.

## 1. Banco de dados (cPanel → MySQL Databases)

- Banco: `julios92_basedados`
- Usuário: `julios92_admin` (senha `@Calabresa2024`), com ALL PRIVILEGES no banco
- Host: `localhost` (já configurado em `public/api/config.php`)

No phpMyAdmin, selecione o banco e importe o arquivo `database_migration.sql`
(schema + dados).

## 2. Build do frontend

```bash
npm install
npm run build
```

Isso gera `dist/`, já contendo a pasta `api/` e o `.htaccess` (copiados de `public/`).

## 3. Upload

Envie **todo o conteúdo** de `dist/` para `public_html/`:

```
public_html/
  index.html
  assets/
  .htaccess            (SPA fallback do React Router)
  api/                 (auth.php, db.php, rest.php, upload.php, config.php)
  uploads/             (criar manualmente, permissão 755)
```

Crie `public_html/uploads/` com chmod 755 (usada pelo `upload.php`).

## 4. Segurança

- Proteja `api/config.php` criando `public_html/api/.htaccess`:

```apache
<Files "config.php">
  Require all denied
</Files>
```

- Troque a senha do admin por um hash bcrypt. Gere no servidor:

```php
<?php echo password_hash('SUA_SENHA', PASSWORD_DEFAULT);
```

E aplique no phpMyAdmin:

```sql
UPDATE usuarios SET senha = '<hash gerado>' WHERE email = 'admin@juliopizza.com';
```

O login usa `password_verify`, então a senha **precisa** estar em hash.

## 5. Testes rápidos

```bash
curl https://juliospizzahouse.com.br/api/rest.php?table=pizzas
curl -X POST https://juliospizzahouse.com.br/api/auth.php?action=login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@juliopizza.com","password":"SUA_SENHA"}'
```

O primeiro deve retornar JSON com as pizzas (tabela pública); o segundo, um
`access_token`.

## 6. Notas

- Tabelas públicas para leitura sem token: `pizzas`, `carousel_images`,
  `home_config`, `instagram_posts`. Todo o resto exige `Authorization: Bearer <token>`.
- Sem Realtime: telas que dependiam de subscriptions usam recarregamento manual.
- CORS liberado apenas para `https://juliospizzahouse.com.br` e `www` (em `config.php`).
- Requer PHP 7.4+ com extensão PDO MySQL (padrão no HostGator).

## Solução de problemas

| Sintoma | Causa provável |
|---|---|
| `Database connection failed` | usuário sem privilégio no banco ou nome do banco errado |
| 401 em todas as rotas admin | header `Authorization` bloqueado — confira o `.htaccess` |
| 404 ao recarregar rota interna | `.htaccess` do SPA ausente em `public_html/` |
| Upload falha | pasta `uploads/` inexistente ou sem permissão 755 |
