-- Script de inicializacao do banco de dados da TechNova.
-- Executado automaticamente pelo container do PostgreSQL na primeira subida
-- (volume /docker-entrypoint-initdb.d definido no docker-compose.yml).

CREATE TABLE IF NOT EXISTS pedidos (
    id             SERIAL PRIMARY KEY,
    cliente        VARCHAR(120)  NOT NULL,
    produto        VARCHAR(120)  NOT NULL,
    quantidade     INTEGER       NOT NULL CHECK (quantidade > 0),
    valor_unitario NUMERIC(10,2) NOT NULL CHECK (valor_unitario > 0),
    status         VARCHAR(20)   NOT NULL DEFAULT 'pendente',
    criado_em      TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos (status);

-- Massa de dados inicial para demonstracao do ambiente.
INSERT INTO pedidos (cliente, produto, quantidade, valor_unitario, status) VALUES
    ('Mercado Sao Jorge',   'Licenca ERP Anual',     2, 1250.00, 'pago'),
    ('Padaria Tres Irmaos', 'Modulo Fiscal',         1,  480.90, 'pendente'),
    ('Auto Pecas Delta',    'Suporte Tecnico 12x',   3,  199.90, 'enviado');
