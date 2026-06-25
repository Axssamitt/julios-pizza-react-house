
CREATE TABLE usuarios (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'user',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE carousel_images (
    id VARCHAR(36) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    url_imagem TEXT NOT NULL,
    ordem INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE configuracao_email (
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

CREATE TABLE configuracoes (
    id VARCHAR(36) PRIMARY KEY,
    chave VARCHAR(255) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE formularios_contato (
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

CREATE TABLE contrato_itens_adicionais (
    id VARCHAR(36) PRIMARY KEY,
    formulario_id VARCHAR(36) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    quantidade INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (formulario_id) REFERENCES formularios_contato(id) ON DELETE CASCADE
);

CREATE TABLE contrato_parcelamentos (
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

CREATE TABLE home_config (
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

CREATE TABLE instagram_posts (
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

CREATE TABLE page_analytics (
    id VARCHAR(36) PRIMARY KEY,
    pagina VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pizzas (
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
