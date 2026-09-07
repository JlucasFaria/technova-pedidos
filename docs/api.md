# Documentação da API — TechNova Pedidos

Base URL local: `http://localhost:3000`

Todas as respostas são no formato `application/json`.

## Modelo de dados

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `id` | inteiro | gerado | Identificador do pedido |
| `cliente` | texto | sim | Mínimo de 3 caracteres |
| `produto` | texto | sim | Mínimo de 2 caracteres |
| `quantidade` | inteiro | sim | Maior que zero |
| `valorUnitario` | decimal | sim | Maior que zero |
| `status` | texto | não | `pendente`, `pago`, `enviado`, `entregue` ou `cancelado` (padrão: `pendente`) |
| `criadoEm` | data/hora | gerado | Data de criação do pedido |

---

## `GET /api/health`

Verificação de saúde utilizada pelo `HEALTHCHECK` do container e pelo pipeline de CI.

**Resposta `200 OK`**

```json
{
  "status": "ok",
  "servico": "technova-pedidos",
  "versao": "1.0.0",
  "banco": { "modo": "postgres", "conectado": true },
  "horario": "2026-09-07T18:32:10.482Z"
}
```

---

## `GET /api/pedidos`

Lista todos os pedidos cadastrados.

**Resposta `200 OK`**

```json
[
  {
    "id": 1,
    "cliente": "Mercado Sao Jorge",
    "produto": "Licenca ERP Anual",
    "quantidade": 2,
    "valorUnitario": 1250,
    "status": "pago",
    "criadoEm": "2026-09-07T18:00:00.000Z"
  }
]
```

---

## `GET /api/pedidos/:id`

Consulta um pedido específico.

- `200 OK` — pedido encontrado.
- `404 Not Found` — `{ "erro": "Pedido nao encontrado." }`

---

## `POST /api/pedidos`

Cadastra um novo pedido.

**Requisição**

```bash
curl -X POST http://localhost:3000/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{"cliente":"Padaria Tres Irmaos","produto":"Modulo Fiscal","quantidade":1,"valorUnitario":480.90}'
```

- `201 Created` — retorna o pedido criado.
- `400 Bad Request` — retorna a lista de erros de validação:

```json
{ "erros": ["O campo \"quantidade\" deve ser um numero inteiro maior que zero."] }
```

---

## `PATCH /api/pedidos/:id/status`

Atualiza apenas o status do pedido.

```bash
curl -X PATCH http://localhost:3000/api/pedidos/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"enviado"}'
```

- `200 OK` — retorna o pedido atualizado.
- `400 Bad Request` — status fora da lista permitida.
- `404 Not Found` — pedido inexistente.

---

## `DELETE /api/pedidos/:id`

Remove um pedido.

- `204 No Content` — removido com sucesso.
- `404 Not Found` — pedido inexistente.

---

## Códigos de erro

| Código | Significado |
|---|---|
| `400` | Dados inválidos na requisição |
| `404` | Recurso não encontrado |
| `500` | Erro interno do servidor |
| `503` | Aplicação sem conexão com o banco de dados |
