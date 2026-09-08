# TechNova Pedidos

![CI](https://github.com/JlucasFaria/technova-pedidos/actions/workflows/ci.yml/badge.svg)
![Node](https://img.shields.io/badge/node-20.x-339933)
![Docker](https://img.shields.io/badge/docker-compose-2496ED)
![License](https://img.shields.io/badge/license-MIT-blue)

Sistema de gestão de pedidos da **TechNova Soluções em Software**, utilizado como projeto-piloto na adoção da **Cultura DevOps** pela empresa.

---

## Descrição do projeto

A TechNova é uma software house de médio porte que desenvolvia e publicava suas aplicações de forma totalmente manual: o código era trocado por e-mail e pen drive, não havia versionamento, o ambiente de cada desenvolvedor era diferente do ambiente de produção e a publicação de uma nova versão dependia de uma pessoa específica executando comandos na madrugada.

Este repositório é o resultado da consultoria contratada pela diretoria: um projeto-piloto que reconstrói o sistema de pedidos aplicando versionamento com Git e GitHub, colaboração por branches e Pull Requests, containerização com Docker e automação por meio de um pipeline de Integração Contínua.

A aplicação em si é uma **API REST de gestão de pedidos** com um painel web que permite cadastrar, listar, atualizar o status e excluir pedidos de clientes.

## Objetivo

| Objetivo | Como o projeto atende |
|---|---|
| Eliminar a perda de código e o descontrole de versões | Versionamento com Git e repositório remoto no GitHub |
| Organizar o trabalho da equipe | Branches `main` / `desenvolvimento` / `feature/*`, Pull Requests, Issues, Milestones e Projects |
| Acabar com o "na minha máquina funciona" | Containerização da aplicação e do banco de dados com Docker e Docker Compose |
| Detectar erros antes da entrega | Pipeline de Integração Contínua executando testes automatizados a cada push |
| Preservar o conhecimento da equipe | Documentação no README, na Wiki e no guia de contribuição |

## Tecnologias utilizadas

| Categoria | Tecnologia | Versão | Uso no projeto |
|---|---|---|---|
| Runtime | Node.js | 20.x | Execução da aplicação |
| Framework web | Express | 4.19 | Rotas e middlewares da API REST |
| Banco de dados | PostgreSQL | 16 (alpine) | Persistência dos pedidos em container |
| Driver de banco | node-postgres (`pg`) | 8.12 | Conexão da API com o PostgreSQL |
| Testes | `node:test` (nativo) | Node 20+ | Testes automatizados de integração da API |
| Front-end | HTML5, CSS3 e JavaScript | — | Painel web consumindo a API |
| Containers | Docker e Docker Compose | 29.x | Empacotamento e orquestração do ambiente |
| Versionamento | Git e GitHub | 2.52 | Controle de versão local e remoto |
| Integração Contínua | GitHub Actions | — | Pipeline de build, testes e imagem Docker |

## Estrutura de pastas

```
technova-pedidos/
├── .github/
│   ├── ISSUE_TEMPLATE/        # Modelos de abertura de issues
│   ├── workflows/
│   │   └── ci.yml             # Pipeline de Integração Contínua
│   └── pull_request_template.md
├── db/
│   └── init.sql               # Criação das tabelas e massa inicial de dados
├── docs/
│   └── api.md                 # Documentação dos endpoints da API
├── public/                    # Painel web (front-end)
│   ├── app.js
│   ├── index.html
│   └── style.css
├── src/
│   ├── db/index.js            # Conexão com o banco (Postgres ou memória)
│   ├── repositories/          # Acesso aos dados dos pedidos
│   ├── routes/                # Rotas HTTP da API
│   ├── validators/            # Regras de validação dos pedidos
│   ├── app.js                 # Configuração do Express
│   └── server.js              # Inicialização do servidor
├── tests/
│   └── pedidos.test.js        # Testes automatizados executados na CI
├── .dockerignore
├── .env.example
├── .gitignore
├── CHANGELOG.md
├── CONTRIBUTING.md
├── Dockerfile                 # Imagem da aplicação (multi-stage)
├── docker-compose.yml         # Orquestração da API + banco de dados
├── LICENSE
├── package.json
└── README.md
```

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20 ou superior (execução local)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) com Docker Compose (execução em containers)
- [Git](https://git-scm.com/) 2.40 ou superior

## Instruções de instalação

```bash
# 1. Clonar o repositório
git clone https://github.com/JlucasFaria/technova-pedidos.git

# 2. Entrar na pasta do projeto
cd technova-pedidos

# 3. Instalar as dependências
npm install

# 4. Criar o arquivo de variáveis de ambiente a partir do modelo
cp .env.example .env
```

## Instruções de execução

### Opção A — Execução local (modo desenvolvimento)

Sem `DATABASE_URL` configurada, a aplicação usa armazenamento em memória e não exige banco de dados.

```bash
npm start          # inicia a API em http://localhost:3000
npm run dev        # inicia com recarregamento automático
npm test           # executa os testes automatizados
```

### Opção B — Execução em containers (recomendada)

Sobe a API e o PostgreSQL já com as tabelas criadas pelo `db/init.sql`.

```bash
docker compose up -d --build   # constrói a imagem e sobe os containers
docker compose ps              # verifica os containers em execução
docker compose logs -f api     # acompanha os logs da aplicação
docker compose down            # encerra o ambiente
```

Acesse o painel em **http://localhost:3000** e a verificação de saúde em **http://localhost:3000/api/health**.

### Endpoints principais

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/health` | Verificação de saúde da aplicação e do banco |
| `GET` | `/api/pedidos` | Lista todos os pedidos |
| `GET` | `/api/pedidos/:id` | Consulta um pedido específico |
| `POST` | `/api/pedidos` | Cadastra um novo pedido |
| `PATCH` | `/api/pedidos/:id/status` | Atualiza o status de um pedido |
| `DELETE` | `/api/pedidos/:id` | Remove um pedido |

A documentação detalhada, com exemplos de requisição e resposta, está em [`docs/api.md`](docs/api.md) e na [Wiki do projeto](https://github.com/JlucasFaria/technova-pedidos/wiki).

## Fluxo de trabalho e branches

| Branch | Finalidade |
|---|---|
| `main` | Versão estável, pronta para produção. Recebe código apenas via Pull Request. |
| `desenvolvimento` | Integração do trabalho da equipe antes de chegar à `main`. |
| `feature/*` | Uma branch por funcionalidade, criada a partir de `desenvolvimento`. |

As regras de contribuição, o padrão de mensagens de commit (Conventional Commits) e o processo de Pull Request estão descritos em [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Integração Contínua

O pipeline definido em [`.github/workflows/ci.yml`](.github/workflows/ci.yml) é disparado a cada `push` e a cada Pull Request para `main` e `desenvolvimento`, e executa:

1. **Verificação de código** — checkout, instalação das dependências e análise de sintaxe de todos os arquivos JavaScript;
2. **Testes automatizados** — execução da suíte nas versões 20 e 22 do Node.js;
3. **Testes com PostgreSQL** — execução dos testes de integração contra um banco real, subido como serviço do pipeline;
4. **Build da imagem Docker** — construção da imagem e teste de subida do container com verificação do endpoint de saúde;
5. **Publicação da imagem** — envio da imagem aprovada para o GitHub Container Registry (apenas em `push` na `main`);
6. **Resumo do pipeline** — tabela com o resultado de cada etapa.

### Imagem publicada

A cada integração na `main`, o pipeline publica a imagem validada no GitHub Container Registry, etiquetada com `latest` e com o SHA do commit:

```bash
docker pull ghcr.io/jlucasfaria/technova-pedidos:latest
docker run -d -p 3000:3000 ghcr.io/jlucasfaria/technova-pedidos:latest
```

Publicar a imagem em vez de reconstruí-la manualmente garante que o artefato executado em qualquer ambiente é exatamente o que passou por todas as validações — é o primeiro passo da Entrega Contínua.

## Versão

Versão atual: **1.0.0** — veja o histórico completo em [`CHANGELOG.md`](CHANGELOG.md) e nas [Releases](https://github.com/JlucasFaria/technova-pedidos/releases).

## Licença

Distribuído sob a licença MIT. Consulte o arquivo [`LICENSE`](LICENSE) para mais detalhes.

## Autor

**João Lucas Faria** — [@JlucasFaria](https://github.com/JlucasFaria)

Projeto desenvolvido para a avaliação prática das disciplinas de **DevOps e Integração Contínua** — Centro Universitário Internacional Uninter.
