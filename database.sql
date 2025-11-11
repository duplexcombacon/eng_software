-- Tabela de Utilizadores
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'support_tech', -- support_tech, level2_tech, admin
    full_name VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Incidentes
CREATE TABLE incidents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- Email/Comunicações, Hardware/Impressoras, Software/CRM, Redes/Conectividade
    priority VARCHAR(50) NOT NULL, -- Crítica, Alta, Média, Baixa
    status VARCHAR(50) NOT NULL DEFAULT 'Aberto', -- Aberto, Em Progresso, Escalado, Resolvido
    affected_users INT NOT NULL DEFAULT 1,
    created_by INT NOT NULL,
    assigned_to INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- Tabela de Histórico de Mudanças
CREATE TABLE incident_history (
    id SERIAL PRIMARY KEY,
    incident_id INT NOT NULL,
    action VARCHAR(255),
    old_value VARCHAR(255),
    new_value VARCHAR(255),
    changed_by INT NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Índices para performance
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_priority ON incidents(priority);
CREATE INDEX idx_incidents_created_by ON incidents(created_by);
CREATE INDEX idx_incidents_created_at ON incidents(created_at);

-- Dados de teste
INSERT INTO users (username, email, password_hash, role, full_name) VALUES
('marta', 'marta@company.com', '$2b$10$test123', 'support_tech', 'Marta Ferreira'),
('carlos', 'carlos@company.com', '$2b$10$test456', 'level2_tech', 'Carlos Silva');

INSERT INTO incidents (title, description, category, priority, status, affected_users, created_by, assigned_to) VALUES
('Email não funciona', 'Utilizador não consegue aceder ao email corporativo', 'Email/Comunicações', 'Alta', 'Aberto', 1, 1, 1),
('Impressora offline', 'Impressora da 3ª floor não responde', 'Hardware/Impressoras', 'Média', 'Em Progresso', 5, 1, 1),
('CRM lento', 'Sistema CRM está muito lento desde esta manhã', 'Software/CRM', 'Alta', 'Escalado', 12, 1, 2);
