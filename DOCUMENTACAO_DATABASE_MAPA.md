# Mapa de Conexões do Projeto Júlio's Pizza House

## Visão geral

Este projeto usa uma arquitetura em camadas:

- Frontend em React + TypeScript
- Rotas definidas em `src/App.tsx`
- Acesso ao banco via `supabase` em um wrapper customizado
- Backend em PHP para autenticação e CRUD
- Banco MySQL acessado por PDO em `public/api/db.php`

A lógica principal de acesso ao banco está em:

- `src/integrations/api/client.ts`
- `public/api/rest.php`
- `public/api/auth.php`
- `public/api/db.php`

---

## 1) Estrutura de rotas e páginas

Arquivo principal:

- `src/App.tsx`

Rotas definidas:

- `/` → `Index`
- `/cardapio` → `Cardapio`
- `/auth` → `Auth`
- `/admin` → `Admin`
- `*` → `NotFound`

---

## 2) Ponto central de conexão com o banco

Arquivo:

- `src/integrations/api/client.ts`

Esse arquivo cria um objeto `supabase` customizado que não usa o SDK oficial diretamente. Em vez disso, ele faz `fetch()` para arquivos PHP dentro de `public/api`.

Exemplo de padrão:

```ts
const { data, error } = await supabase
  .from('pizzas')
  .select('*')
  .eq('ativo', true)
  .order('nome');
```

Esse código vira uma requisição como:

```http
GET /api/rest.php?table=pizzas&ativo=true&order=nome+ASC
```

---

## 3) PHP responsável por acesso ao banco

### 3.1 `public/api/db.php`

Responsável pela conexão com o MySQL usando PDO.

Funções importantes:

- `generateUUID()`
- `generateToken()`
- `verifyToken()`
- `$allowed_tables`

Principais configurações:

```php
$dsn = "mysql:host={$config['host']};dbname={$config['db']};charset=utf8mb4";
$pdo = new PDO($dsn, $config['user'], $config['pass'], $options);
```

Esse arquivo também define a lista de tabelas permitidas:

- `usuarios`
- `carousel_images`
- `configuracao_email`
- `configuracoes`
- `formularios_contato`
- `contrato_itens_adicionais`
- `contrato_parcelamentos`
- `home_config`
- `instagram_posts`
- `page_analytics`
- `pizzas`

---

### 3.2 `public/api/rest.php`

Responsável por CRUD e leitura genérica das tabelas.

Fluxo:

- valida se a tabela foi informada e se está permitida
- valida autenticação para tabelas protegidas
- aceita `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- monta SQL dinâmico com PDO
- executa `SELECT`, `INSERT`, `UPDATE`, `DELETE`

Tabela pública de leitura sem autenticação:

- `carousel_images`
- `home_config`
- `instagram_posts`
- `pizzas`

Exemplo de login em `rest.php`:

```php
if ($table === 'usuarios' && isset($data['senha'])) {
    $data['senha'] = password_hash($data['senha'], PASSWORD_DEFAULT);
}
```

---

### 3.3 `public/api/auth.php`

Responsável pela autenticação do admin.

Fluxo:

- recebe `POST` com `email` e `password`
- executa:

```php
$stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ? AND ativo = 1");
```

- verifica senha com `password_verify()`
- gera token JWT com `generateToken()`
- retorna JSON com usuário e session

Exemplo de retorno:

```json
{
  "user": { ... },
  "session": { "access_token": "..." }
}
```

---

## 4) Mapa de páginas para banco

### 4.1 Página inicial

Arquivo:

- `src/pages/Index.tsx`

Componentes usados:

- `Hero`
- `PizzaGallery`
- `InstagramFeed`
- `ContactForm`
- `AboutUs`
- `Footer`

Conexões:

- `home_config`
- `pizzas`
- `instagram_posts`
- `formularios_contato`
- `configuracoes`

Exemplos:

- `Hero` -> `home_config`
- `PizzaGallery` -> `pizzas`
- `InstagramFeed` -> `instagram_posts`
- `ContactForm` -> `formularios_contato` insert
- `AboutUs` -> `home_config`
- `Footer` -> `configuracoes` + `home_config`

---

### 4.2 Página do cardápio

Arquivo:

- `src/pages/Cardapio.tsx`

Conexão:

```ts
await supabase
  .from('pizzas')
  .select('*')
  .eq('ativo', true)
  .order('nome');
```

Tabela acessada:

- `pizzas`

Objetivo:

- carregar pizzas ativas para a página de cardápio

---

### 4.3 Página de login

Arquivo:

- `src/pages/Auth.tsx`

Conexão:

```ts
await supabase.auth.signInWithPassword({ email, password });
```

Tabela acessada:

- `usuarios`

Objetivo:

- validar login do administrador

---

### 4.4 Página admin

Arquivo:

- `src/pages/Admin.tsx`

Essa página carrega os managers abaixo:

- `HomeConfigManager`
- `CarouselManager`
- `PizzaManager`
- `InstagramManager`
- `ConfigManager`
- `FormularioManager`
- `ContratoManager`
- `UserManager`

Cada manager acessa uma tabela específica.

---

## 5) Mapa dos managers do admin

### `HomeConfigManager`

Arquivo:

- `src/components/admin/HomeConfigManager.tsx`

Tabela:

- `home_config`

Operações:

- `SELECT`
- `INSERT`
- `UPDATE`

---

### `CarouselManager`

Arquivo:

- `src/components/admin/CarouselManager.tsx`

Tabela:

- `carousel_images`

Operações:

- `SELECT`
- `INSERT`
- `UPDATE`
- `DELETE`

Também faz upload de imagem para storage do bucket `images` via `supabase.storage`.

---

### `PizzaManager`

Arquivo:

- `src/components/admin/PizzaManager.tsx`

Tabela:

- `pizzas`

Operações:

- `SELECT`
- `INSERT`
- `UPDATE`
- `DELETE`

---

### `InstagramManager`

Arquivo:

- `src/components/admin/InstagramManager.tsx`

Tabela:

- `instagram_posts`

Operações:

- `SELECT`
- `INSERT`
- `UPDATE`
- `DELETE`

---

### `ConfigManager`

Arquivo:

- `src/components/admin/ConfigManager.tsx`

Tabela:

- `configuracoes`

Operações:

- `SELECT`
- `INSERT`
- `UPDATE`
- `DELETE`

---

### `FormularioManager`

Arquivo:

- `src/components/admin/FormularioManager.tsx`

Tabela:

- `formularios_contato`

Operações:

- `SELECT`
- `UPDATE`
- `DELETE`

---

### `ContratoManager`

Arquivo:

- `src/components/admin/ContratoManager.tsx`

Tabelas:

- `contrato_itens_adicionais`
- `contrato_parcelamentos`
- `formularios_contato`
- `configuracoes`

Operações:

- `SELECT`
- `INSERT`
- `UPDATE`
- `DELETE`

---

### `UserManager`

Arquivo:

- `src/components/admin/UserManager.tsx`

Tabela:

- `usuarios`

Operações:

- `SELECT`
- `INSERT`
- `UPDATE`
- `DELETE`

---

## 6) Analytics

Arquivo:

- `src/hooks/useAnalytics.tsx`

Conexão:

```ts
await supabase.from('page_analytics').insert({ ... });
```

Tabela:

- `page_analytics`

Objetivo:

- registrar acesso de páginas e monitorar visitas

---

## 7) Fluxo de leitura pública

A lógica de acesso público é bem simples:

- páginas públicas fazem leitura direta de tabelas permitidas
- a tabela será liberada sem autenticação se estiver em `$public_tables`
- operações de escrita exigem autenticação e token válido

Exemplo em `rest.php`:

```php
$public_tables = ['carousel_images', 'home_config', 'instagram_posts', 'pizzas'];
```

Isso explica porque a home, o carrossel e o cardápio podem ser exibidos sem login, mas o admin precisa logar para editar.

---

## 8) Resumo do fluxo completo

```text
Página React
  -> supabase.from('X')
  -> client.ts
  -> fetch('/api/rest.php')
  -> rest.php
  -> valida tabela + token
  -> conecta em db.php
  -> executa SQL no MySQL
  -> retorna JSON
  -> página renderiza dados
```

---

## 9) Comandos relevantes do projeto

### Node/Vite

```bash
npm install
npm run dev
npm run build
npm run preview
```

### Frontend e HTTP

- `fetch(...)`
- `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- `localStorage` para sessão admin

### Banco e backend

- `PDO::prepare()`
- `execute()`
- `password_hash()`
- `password_verify()`
- `generateToken()`
- `verifyToken()`

---

## 10) Observações úteis para manutenção

1. A camada de banco no frontend é um wrapper customizado, não o SDK oficial do Supabase.
2. A autenticação do admin usa `localStorage` para guardar a sessão.
3. O backend PHP faz validação de tabela e token antes de aceitar alterações.
4. A maior parte da lógica de “banco” está centralizada em `public/api` e em `src/integrations/api/client.ts`.
5. Quando for fazer alterações no banco, primeiro confirme:
   - qual página chama a operação
   - qual tabela está sendo usada
   - se a operação é leitura pública ou escrita autenticada

---

## 11) Pontos de atenção para alteração

Se você for alterar qualquer parte do sistema, comece por estes arquivos:

- `src/App.tsx` → rotas
- `src/integrations/api/client.ts` → protocolo de comunicação
- `public/api/rest.php` → CRUD e regras de acesso
- `public/api/auth.php` → autenticação
- `public/api/db.php` → conexão e tokens
- `src/pages/*` → páginas que exibem dados
- `src/components/admin/*` → telas de gestão no painel

---

## 12) Mapa visual rápido

```text
React Pages
  │
  ├── Index → home_config + pizzas + instagram_posts + formularios_contato + configuracoes
  ├── Cardapio → pizzas
  ├── Auth → usuarios
  └── Admin
        ├── HomeConfigManager → home_config
        ├── CarouselManager → carousel_images
        ├── PizzaManager → pizzas
        ├── InstagramManager → instagram_posts
        ├── ConfigManager → configuracoes
        ├── FormularioManager → formularios_contato
        ├── ContratoManager → contrato_itens_adicionais + contrato_parcelamentos
        ├── UserManager → usuarios
        └── useAnalytics → page_analytics

        ↓

  PHP API
      ├── rest.php
      ├── auth.php
      └── db.php

        ↓

  MySQL Database
```

---

# Conclusão

O padrão do projeto é: frontend chama `supabase` customizado, que dispara `fetch()` para PHP, e PHP executa SQL no banco por PDO. Isso centraliza a regra de acesso e facilita manutenção, mas exige que qualquer alteração no banco ou autenticação seja feita com atenção em `public/api` e no client customizado.
