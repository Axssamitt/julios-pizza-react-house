
-- Criação do banco de dados (opcional se já existir)
-- CREATE DATABASE IF NOT EXISTS julios92_basedados;
-- USE julios92_basedados;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `nome` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `senha` VARCHAR(255) NOT NULL,
  `tipo` VARCHAR(50) DEFAULT 'admin',
  `ativo` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Pizzas
CREATE TABLE IF NOT EXISTS `pizzas` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `nome` VARCHAR(255) NOT NULL,
  `ingredientes` TEXT NOT NULL,
  `imagem_url` VARCHAR(500),
  `tipo` VARCHAR(50),
  `ordem` INT DEFAULT 0,
  `ativo` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Imagens do Carrossel
CREATE TABLE IF NOT EXISTS `carousel_images` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `titulo` VARCHAR(255) NOT NULL,
  `url_imagem` VARCHAR(500) NOT NULL,
  `ordem` INT DEFAULT 0,
  `ativo` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Configurações Gerais
CREATE TABLE IF NOT EXISTS `configuracoes` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `chave` VARCHAR(100) NOT NULL UNIQUE,
  `valor` TEXT NOT NULL,
  `descricao` VARCHAR(255),
  `ativo` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Configuração da Home
CREATE TABLE IF NOT EXISTS `home_config` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `titulo_hero` VARCHAR(255) NOT NULL,
  `subtitulo_hero` TEXT NOT NULL,
  `align_titulo_hero` VARCHAR(50) DEFAULT 'center',
  `align_subtitulo_hero` VARCHAR(50) DEFAULT 'center',
  `texto_sobre` TEXT,
  `nome_empresa` VARCHAR(255),
  `telefone` VARCHAR(50),
  `endereco` TEXT,
  `instagram_url` VARCHAR(255),
  `facebook_url` VARCHAR(255),
  `visivel_nome_empresa` TINYINT(1) DEFAULT 1,
  `visivel_telefone` TINYINT(1) DEFAULT 1,
  `visivel_endereco` TINYINT(1) DEFAULT 1,
  `visivel_instagram` TINYINT(1) DEFAULT 1,
  `visivel_facebook` TINYINT(1) DEFAULT 1,
  `visivel_sobre` TINYINT(1) DEFAULT 1,
  `atualizado_por` CHAR(36),
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`atualizado_por`) REFERENCES `usuarios`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Posts do Instagram
CREATE TABLE IF NOT EXISTS `instagram_posts` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `titulo` VARCHAR(255) NOT NULL,
  `url_imagem` VARCHAR(500) NOT NULL,
  `url_post` VARCHAR(500) NOT NULL,
  `descricao` TEXT,
  `curtidas` INT DEFAULT 0,
  `comentarios` INT DEFAULT 0,
  `ordem` INT DEFAULT 0,
  `ativo` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Formulários de Contato
CREATE TABLE IF NOT EXISTS `formularios_contato` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `nome_completo` VARCHAR(255) NOT NULL,
  `telefone` VARCHAR(50) NOT NULL,
  `cpf` VARCHAR(20) NOT NULL,
  `endereco` TEXT NOT NULL,
  `data_evento` DATE NOT NULL,
  `horario` TIME NOT NULL,
  `endereco_evento` TEXT NOT NULL,
  `quantidade_adultos` INT NOT NULL,
  `quantidade_criancas` INT DEFAULT 0,
  `valor_total` DECIMAL(10,2),
  `valor_entrada` DECIMAL(10,2),
  `observacoes` TEXT,
  `status` VARCHAR(50) DEFAULT 'pendente',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Itens Adicionais do Contrato
CREATE TABLE IF NOT EXISTS `contrato_itens_adicionais` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `formulario_id` CHAR(36) NOT NULL,
  `descricao` VARCHAR(255) NOT NULL,
  `valor` DECIMAL(10,2) NOT NULL,
  `quantidade` INT DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`formulario_id`) REFERENCES `formularios_contato`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Parcelamentos
CREATE TABLE IF NOT EXISTS `contrato_parcelamentos` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `formulario_id` CHAR(36) NOT NULL,
  `numero_parcela` INT NOT NULL,
  `valor_parcela` DECIMAL(10,2) NOT NULL,
  `data_vencimento` DATE NOT NULL,
  `status` VARCHAR(50) DEFAULT 'pendente',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_form_parcela` (`formulario_id`, `numero_parcela`),
  FOREIGN KEY (`formulario_id`) REFERENCES `formularios_contato`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Usuário Administrador Inicial
-- Senha: @Calabresa2024
INSERT IGNORE INTO `usuarios` (`id`, `nome`, `email`, `senha`, `tipo`, `ativo`)
VALUES (REPLACE(UUID(), '-', ''), 'Admin', 'admin@admin.com', '@Calabresa2024', 'admin', 1);
