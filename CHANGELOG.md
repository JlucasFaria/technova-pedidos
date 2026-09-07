# Changelog

Todas as mudanças relevantes do projeto são registradas neste arquivo.

O formato segue o padrão [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o versionamento segue o [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.0] — 2026-09-07

Primeira versão estável do projeto-piloto de adoção da Cultura DevOps na TechNova.

### Adicionado

- API REST de gestão de pedidos com Express (listagem, consulta, cadastro, atualização de status e exclusão).
- Endpoint `/api/health` com verificação do estado da aplicação e do banco de dados.
- Camada de validação com regras de negócio do pedido e lista de status permitidos.
- Painel web em HTML, CSS e JavaScript para acompanhamento dos pedidos.
- Suporte a PostgreSQL com fallback para armazenamento em memória.
- Script `db/init.sql` com a criação das tabelas e massa inicial de dados.
- Suíte com 9 testes automatizados de integração da API.
- `Dockerfile` multi-stage e `docker-compose.yml` orquestrando a API e o banco de dados.
- Pipeline de Integração Contínua no GitHub Actions com verificação de código, testes em duas versões do Node.js e build da imagem Docker.
- Documentação do projeto: `README.md`, `CONTRIBUTING.md`, `docs/api.md` e Wiki.
- Modelos de Issue e de Pull Request.

### Corrigido

- Validação de `quantidade` que permitia o cadastro de pedidos com valor zerado.

[1.0.0]: https://github.com/JlucasFaria/technova-pedidos/releases/tag/v1.0.0
