# Guia de contribuição — TechNova Pedidos

Este documento descreve o fluxo de trabalho adotado pela equipe da TechNova após a implantação da Cultura DevOps. Ele existe para que qualquer pessoa consiga contribuir com o projeto seguindo o mesmo padrão.

## Fluxo de branches

```
main                  versão estável (produção)
 └── desenvolvimento  integração do trabalho da equipe
      └── feature/*   uma branch por funcionalidade
```

Regras:

1. Nunca commitar diretamente na `main`.
2. Toda funcionalidade nasce de uma branch `feature/` criada a partir de `desenvolvimento`.
3. A entrada em `desenvolvimento` e em `main` acontece por **Pull Request**.
4. Todo Pull Request precisa da CI verde antes do merge.

```bash
git checkout desenvolvimento
git pull origin desenvolvimento
git checkout -b feature/nome-da-funcionalidade
```

## Padrão de mensagens de commit

O projeto adota o padrão **Conventional Commits**, no formato:

```
<tipo>(<escopo opcional>): <descrição no imperativo>
```

| Tipo | Quando usar |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de defeito |
| `docs` | Alteração apenas de documentação |
| `test` | Inclusão ou ajuste de testes |
| `refactor` | Mudança de código sem alterar comportamento |
| `chore` | Configuração, dependências e tarefas de infraestrutura |
| `ci` | Alteração no pipeline de Integração Contínua |

Exemplos usados neste repositório:

```
feat(pedidos): adicionar endpoint de atualizacao de status
fix(validacao): recusar quantidade igual a zero
ci(actions): executar testes nas versoes 20 e 22 do node
docs(readme): descrever instrucoes de execucao com docker
```

Boas práticas:

- Mensagem no imperativo ("adicionar", não "adicionado").
- Uma mudança lógica por commit.
- Descrição com até 72 caracteres na primeira linha.
- Corpo do commit explicando o **porquê** quando a mudança não for óbvia.

## Processo de Pull Request

1. Suba a branch: `git push -u origin feature/nome-da-funcionalidade`.
2. Abra o Pull Request para `desenvolvimento` usando o modelo do repositório.
3. Relacione o PR à Issue correspondente (`Closes #numero`).
4. Aguarde a execução do pipeline de CI.
5. Após aprovação, faça o merge e apague a branch de funcionalidade.

## Issues

- Toda tarefa começa por uma Issue, classificada com **labels** e vinculada a uma **Milestone**.
- Use os modelos disponíveis em `.github/ISSUE_TEMPLATE/`.
- O acompanhamento do andamento é feito no **Projects** do repositório.

## Antes de abrir o Pull Request

```bash
npm test                       # a suíte precisa passar integralmente
npm run lint                   # verificação de sintaxe
docker compose up -d --build   # valide a aplicação em container
```
