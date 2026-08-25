CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'user',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS carousel_images (
    id VARCHAR(36) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    url_imagem TEXT NOT NULL,
    ordem INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS configuracao_email (
    id VARCHAR(36) PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    email_remetente VARCHAR(255) NOT NULL,
    smtp_host VARCHAR(255) NOT NULL,
    smtp_port INT NOT NULL,
    smtp_user VARCHAR(255) NOT NULL,
    smtp_pass VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS configuracoes (
    id VARCHAR(36) PRIMARY KEY,
    chave VARCHAR(255) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS formularios_contato (
    id VARCHAR(36) PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    endereco TEXT NOT NULL,
    data_evento DATE NOT NULL,
    horario TIME NOT NULL,
    endereco_evento TEXT NOT NULL,
    quantidade_adultos INT NOT NULL,
    quantidade_criancas INT DEFAULT 0,
    valor_total DECIMAL(10, 2),
    valor_entrada DECIMAL(10, 2),
    observacoes TEXT,
    status VARCHAR(50) DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contrato_itens_adicionais (
    id VARCHAR(36) PRIMARY KEY,
    formulario_id VARCHAR(36) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    quantidade INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (formulario_id) REFERENCES formularios_contato(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contrato_parcelamentos (
    id VARCHAR(36) PRIMARY KEY,
    formulario_id VARCHAR(36) NOT NULL,
    numero_parcela INT NOT NULL,
    valor_parcela DECIMAL(10, 2) NOT NULL,
    data_vencimento DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(formulario_id, numero_parcela),
    FOREIGN KEY (formulario_id) REFERENCES formularios_contato(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS home_config (
    id VARCHAR(36) PRIMARY KEY,
    titulo_hero VARCHAR(255) NOT NULL,
    subtitulo_hero TEXT NOT NULL,
    align_titulo_hero VARCHAR(50) DEFAULT 'center',
    align_subtitulo_hero VARCHAR(50) DEFAULT 'center',
    texto_sobre TEXT,
    nome_empresa VARCHAR(255),
    telefone VARCHAR(20),
    endereco TEXT,
    instagram_url TEXT,
    facebook_url TEXT,
    visivel_titulo_hero BOOLEAN DEFAULT TRUE,
    visivel_subtitulo_hero BOOLEAN DEFAULT TRUE,
    visivel_sobre BOOLEAN DEFAULT TRUE,
    visivel_nome_empresa BOOLEAN DEFAULT TRUE,
    visivel_telefone BOOLEAN DEFAULT TRUE,
    visivel_endereco BOOLEAN DEFAULT TRUE,
    visivel_instagram BOOLEAN DEFAULT TRUE,
    visivel_facebook BOOLEAN DEFAULT TRUE,
    atualizado_por VARCHAR(36),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (atualizado_por) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS instagram_posts (
    id VARCHAR(36) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    url_imagem TEXT NOT NULL,
    url_post TEXT NOT NULL,
    curtidas INT DEFAULT 0,
    comentarios INT DEFAULT 0,
    ordem INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS page_analytics (
    id VARCHAR(36) PRIMARY KEY,
    pagina VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pizzas (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    ingredientes TEXT NOT NULL,
    tipo VARCHAR(50),
    imagem_url TEXT,
    ordem INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed Initial Data

INSERT INTO usuarios (id, nome, email, senha, tipo, ativo)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Juliano Admin',
    'admin@juliosbuffet.com.br',
    '$2y$10$MO/AWG0cgUHEM5AFK39tEOEV9LlAhpFzeTDx11WfWtgPxOMC8d1f6',
    'admin',
    1
)
ON DUPLICATE KEY UPDATE nome=VALUES(nome);

INSERT INTO home_config (
    id, titulo_hero, subtitulo_hero, align_titulo_hero, align_subtitulo_hero,
    texto_sobre, nome_empresa, telefone, endereco, instagram_url, facebook_url,
    visivel_titulo_hero, visivel_subtitulo_hero, visivel_sobre, visivel_nome_empresa,
    visivel_telefone, visivel_endereco, visivel_instagram, visivel_facebook, atualizado_por
)
VALUES (
    'd4c3b2a1-6f5e-b8a7-d0c9-6d5c4b3a2f1e',
    'Júlio\'s Buffet em Domicílio',
    'As melhores pizzas artesanais e buffet completo para o seu evento',
    'center',
    'center',
    'Oferecemos um serviço completo de buffet de pizzas artesanais em domicílio, garantindo sabor, qualidade e praticidade para sua festa ou evento.',
    'Júlio\'s Buffet',
    '(11) 99999-9999',
    'São Paulo - SP',
    'https://instagram.com',
    'https://facebook.com',
    1, 1, 1, 1, 1, 1, 1, 1,
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'
)
ON DUPLICATE KEY UPDATE titulo_hero=VALUES(titulo_hero);

INSERT INTO configuracoes (id, chave, valor, descricao, ativo)
VALUES
    ('c1-whatsapp', 'whatsapp_number', '5511999999999', 'Número do WhatsApp principal', 1)
ON DUPLICATE KEY UPDATE valor=VALUES(valor);
