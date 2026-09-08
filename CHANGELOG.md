# Changelog

Todas as mudanças relevantes do projeto são registradas neste arquivo.

O formato segue o padrão [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o versionamento segue o [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.1] — 2026-09-07

Revisão de qualidade e segurança da versão 1.0.0, com a evolução do pipeline para a Entrega Contínua.

### Corrigido

- **XSS armazenado no painel web** — os campos vindos da API eram injetados na tabela via `innerHTML` sem escape, permitindo que um pedido cadastrado com HTML no nome do cliente executasse script no navegador de quem abrisse o painel.
- JSON malformado no corpo da requisição respondia `500`; passa a responder `400`.
- Identificadores fora do formato numérico (`/api/pedidos/abc`) respondiam `404` em memória, mas `500` no PostgreSQL; agora respondem `404` nos dois modos.
- Campos de texto que não eram texto (objetos, arrays, números) eram aceitos no cadastro.
- Textos e números acima dos limites das colunas (`VARCHAR(120)` e `NUMERIC(10,2)`) só falhavam no modo PostgreSQL; agora são recusados na validação.
- `/api/health` expunha a mensagem de erro do driver do banco, que pode conter usuário e host; o detalhe passou a ficar apenas no log.
- O pool do PostgreSQL não era fechado no encerramento do processo.
- Uma porta já ocupada derrubava a aplicação com um stack trace de `EADDRINUSE`, sem explicar a causa.

### Adicionado

- Job de testes de integração contra um PostgreSQL real no pipeline, com o serviço `postgres:16-alpine`.
- Publicação automática da imagem validada no GitHub Container Registry a cada integração na `main` — primeiro passo da Entrega Contínua.
- Dependabot acompanhando dependências npm, actions do pipeline e a imagem base do Dockerfile.
- Análise estática de segurança com CodeQL, em cada integração e semanalmente.
- Limite de 10 kB no corpo das requisições JSON.
- Suíte ampliada de 9 para 63 testes (55 em memória e 8 contra PostgreSQL), incluindo testes de unidade da validação e guarda de regressão do escape do painel.
- Script `scripts/verificar-sintaxe.js`: a etapa de lint passa a verificar todos os arquivos JavaScript, e não apenas dois arquivos fixos.

### Alterado

- As credenciais do banco saíram do `docker-compose.yml` e passaram a vir do `.env`, que não é versionado.
- A validação do container no pipeline deixou de usar espera fixa de 8 segundos e passou a tentar novamente até a aplicação responder.
- A constante `STATUS_VALIDOS` foi movida do repositório para o validador, eliminando a dependência invertida entre as camadas.
- A versão exibida em `/api/health` passou a vir do `package.json`.

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

[1.0.1]: https://github.com/JlucasFaria/technova-pedidos/releases/tag/v1.0.1
[1.0.0]: https://github.com/JlucasFaria/technova-pedidos/releases/tag/v1.0.0
