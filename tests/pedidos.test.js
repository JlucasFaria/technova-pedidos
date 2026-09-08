'use strict';

const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const app = require('../src/app');
const repositorio = require('../src/repositories/pedidoRepository');

let servidor;
let base;

before(async () => {
  servidor = app.listen(0);
  await new Promise((resolve) => servidor.once('listening', resolve));
  base = `http://127.0.0.1:${servidor.address().port}`;
});

after(() => servidor.close());

beforeEach(() => repositorio.limparMemoria());

async function criarPedido(dados = {}) {
  return fetch(`${base}/api/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cliente: 'Mercado Sao Jorge',
      produto: 'Licenca ERP',
      quantidade: 2,
      valorUnitario: 150.5,
      ...dados
    })
  });
}

function alterarStatus(id, status) {
  return fetch(`${base}/api/pedidos/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
}

// ---------------------------------------------------------------------------
// Saude da aplicacao
// ---------------------------------------------------------------------------

test('GET /api/health responde com status ok', async () => {
  const resposta = await fetch(`${base}/api/health`);
  const corpo = await resposta.json();

  assert.equal(resposta.status, 200);
  assert.equal(corpo.status, 'ok');
  assert.equal(corpo.servico, 'technova-pedidos');
});

test('GET /api/health informa o modo de armazenamento em uso', async () => {
  const corpo = await (await fetch(`${base}/api/health`)).json();

  assert.deepEqual(corpo.banco, { modo: 'memoria', conectado: true });
  assert.ok(!Number.isNaN(Date.parse(corpo.horario)));
});

// ---------------------------------------------------------------------------
// Listagem e consulta
// ---------------------------------------------------------------------------

test('GET /api/pedidos comeca com a lista vazia', async () => {
  const resposta = await fetch(`${base}/api/pedidos`);

  assert.equal(resposta.status, 200);
  assert.deepEqual(await resposta.json(), []);
});

test('GET /api/pedidos devolve os pedidos cadastrados na ordem de criacao', async () => {
  await criarPedido({ cliente: 'Primeiro Cliente' });
  await criarPedido({ cliente: 'Segundo Cliente' });

  const pedidos = await (await fetch(`${base}/api/pedidos`)).json();

  assert.equal(pedidos.length, 2);
  assert.deepEqual(
    pedidos.map((pedido) => pedido.cliente),
    ['Primeiro Cliente', 'Segundo Cliente']
  );
  assert.deepEqual(
    pedidos.map((pedido) => pedido.id),
    [1, 2]
  );
});

test('GET /api/pedidos/:id inexistente retorna 404', async () => {
  const resposta = await fetch(`${base}/api/pedidos/999`);

  assert.equal(resposta.status, 404);
});

test('GET /api/pedidos/:id nao numerico retorna 404 em vez de erro interno', async () => {
  for (const id of ['abc', '1abc', '-1', '0', '1.5', '9999999999999']) {
    const resposta = await fetch(`${base}/api/pedidos/${id}`);
    assert.equal(resposta.status, 404, `id "${id}" deveria resultar em 404`);
  }
});

test('GET /api/pedidos/:id devolve o pedido correspondente', async () => {
  const criado = await (await criarPedido()).json();

  const pedido = await (await fetch(`${base}/api/pedidos/${criado.id}`)).json();

  assert.deepEqual(pedido, criado);
});

// ---------------------------------------------------------------------------
// Cadastro
// ---------------------------------------------------------------------------

test('POST /api/pedidos cria um pedido valido', async () => {
  const resposta = await criarPedido();
  const pedido = await resposta.json();

  assert.equal(resposta.status, 201);
  assert.equal(pedido.cliente, 'Mercado Sao Jorge');
  assert.equal(pedido.status, 'pendente');
  assert.ok(pedido.id > 0);
});

test('POST /api/pedidos aceita numeros enviados como texto (formulario web)', async () => {
  const pedido = await (await criarPedido({ quantidade: '3', valorUnitario: '10.50' })).json();

  assert.equal(pedido.quantidade, 3);
  assert.equal(pedido.valorUnitario, 10.5);
});

test('POST /api/pedidos aceita um status inicial valido', async () => {
  const resposta = await criarPedido({ status: 'pago' });

  assert.equal(resposta.status, 201);
  assert.equal((await resposta.json()).status, 'pago');
});

test('POST /api/pedidos remove espacos em volta dos textos', async () => {
  const pedido = await (await criarPedido({ cliente: '  Loja Central  ' })).json();

  assert.equal(pedido.cliente, 'Loja Central');
});

test('POST /api/pedidos ignora campos controlados pelo servidor', async () => {
  const pedido = await (
    await criarPedido({ id: 999, criadoEm: '1900-01-01T00:00:00.000Z' })
  ).json();

  assert.equal(pedido.id, 1);
  assert.notEqual(pedido.criadoEm, '1900-01-01T00:00:00.000Z');
});

test('POST /api/pedidos rejeita quantidade invalida', async () => {
  const resposta = await criarPedido({ quantidade: 0 });
  const corpo = await resposta.json();

  assert.equal(resposta.status, 400);
  assert.ok(corpo.erros.some((erro) => erro.includes('quantidade')));
});

test('POST /api/pedidos rejeita cliente ausente', async () => {
  const resposta = await criarPedido({ cliente: '' });

  assert.equal(resposta.status, 400);
});

test('POST /api/pedidos rejeita campos de texto que nao sao texto', async () => {
  for (const cliente of [{ a: 1 }, ['Loja'], 42, true, null]) {
    const resposta = await criarPedido({ cliente });
    assert.equal(resposta.status, 400, `cliente ${JSON.stringify(cliente)} deveria ser recusado`);
  }
});

test('POST /api/pedidos rejeita texto acima do limite da coluna do banco', async () => {
  const resposta = await criarPedido({ cliente: 'x'.repeat(121) });
  const corpo = await resposta.json();

  assert.equal(resposta.status, 400);
  assert.ok(corpo.erros.some((erro) => erro.includes('cliente')));
});

test('POST /api/pedidos rejeita quantidade e valor fora dos limites do banco', async () => {
  const quantidade = await criarPedido({ quantidade: 999999999999 });
  assert.equal(quantidade.status, 400);

  const valor = await criarPedido({ valorUnitario: 100000000 });
  assert.equal(valor.status, 400);
});

test('POST /api/pedidos rejeita numeros disfarcados de array', async () => {
  const resposta = await criarPedido({ quantidade: [5] });

  assert.equal(resposta.status, 400);
});

test('POST /api/pedidos rejeita status desconhecido no cadastro', async () => {
  const resposta = await criarPedido({ status: 'arquivado' });
  const corpo = await resposta.json();

  assert.equal(resposta.status, 400);
  assert.ok(corpo.erros.some((erro) => erro.includes('status')));
});

test('POST /api/pedidos acumula todos os erros de validacao', async () => {
  const resposta = await fetch(`${base}/api/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  const corpo = await resposta.json();

  assert.equal(resposta.status, 400);
  assert.equal(corpo.erros.length, 4);
});

test('POST /api/pedidos responde 400 quando o JSON esta malformado', async () => {
  const resposta = await fetch(`${base}/api/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"cliente":'
  });

  assert.equal(resposta.status, 400);
  assert.equal((await resposta.json()).erro, 'Corpo da requisicao invalido.');
});

test('POST /api/pedidos recusa corpos acima do limite configurado', async () => {
  const resposta = await fetch(`${base}/api/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cliente: 'x'.repeat(20000) })
  });

  assert.equal(resposta.status, 413);
});

test('POST /api/pedidos rejeita corpo que nao e um objeto', async () => {
  const resposta = await fetch(`${base}/api/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([1, 2, 3])
  });

  assert.equal(resposta.status, 400);
});

// ---------------------------------------------------------------------------
// Atualizacao de status
// ---------------------------------------------------------------------------

test('PATCH /api/pedidos/:id/status altera o status do pedido', async () => {
  const { id } = await (await criarPedido()).json();

  const resposta = await alterarStatus(id, 'pago');

  assert.equal(resposta.status, 200);
  assert.equal((await resposta.json()).status, 'pago');
});

test('PATCH /api/pedidos/:id/status recusa status desconhecido', async () => {
  const { id } = await (await criarPedido()).json();

  const resposta = await alterarStatus(id, 'arquivado');

  assert.equal(resposta.status, 400);
});

test('PATCH /api/pedidos/:id/status aceita todos os status do dominio', async () => {
  const { id } = await (await criarPedido()).json();

  for (const status of ['pendente', 'pago', 'enviado', 'entregue', 'cancelado']) {
    const resposta = await alterarStatus(id, status);
    assert.equal(resposta.status, 200);
    assert.equal((await resposta.json()).status, status);
  }
});

test('PATCH /api/pedidos/:id/status recusa status vindo do prototype', async () => {
  const { id } = await (await criarPedido()).json();

  const resposta = await alterarStatus(id, 'constructor');

  assert.equal(resposta.status, 400);
});

test('PATCH /api/pedidos/:id/status sem corpo responde 400', async () => {
  const resposta = await fetch(`${base}/api/pedidos/1/status`, { method: 'PATCH' });

  assert.equal(resposta.status, 400);
});

test('PATCH /api/pedidos/:id/status em pedido inexistente responde 404', async () => {
  const resposta = await alterarStatus(999, 'pago');

  assert.equal(resposta.status, 404);
});

test('PATCH /api/pedidos/:id/status nao altera os demais campos do pedido', async () => {
  const criado = await (await criarPedido()).json();

  const atualizado = await (await alterarStatus(criado.id, 'enviado')).json();

  assert.deepEqual(atualizado, { ...criado, status: 'enviado' });
});

// ---------------------------------------------------------------------------
// Exclusao
// ---------------------------------------------------------------------------

test('DELETE /api/pedidos/:id remove o pedido', async () => {
  const { id } = await (await criarPedido()).json();

  const remocao = await fetch(`${base}/api/pedidos/${id}`, { method: 'DELETE' });
  assert.equal(remocao.status, 204);

  const busca = await fetch(`${base}/api/pedidos/${id}`);
  assert.equal(busca.status, 404);
});

test('DELETE /api/pedidos/:id duas vezes responde 404 na segunda', async () => {
  const { id } = await (await criarPedido()).json();

  assert.equal((await fetch(`${base}/api/pedidos/${id}`, { method: 'DELETE' })).status, 204);
  assert.equal((await fetch(`${base}/api/pedidos/${id}`, { method: 'DELETE' })).status, 404);
});

test('DELETE /api/pedidos/:id invalido responde 404', async () => {
  const resposta = await fetch(`${base}/api/pedidos/abc`, { method: 'DELETE' });

  assert.equal(resposta.status, 404);
});

test('DELETE /api/pedidos/:id nao afeta os outros pedidos', async () => {
  const primeiro = await (await criarPedido({ cliente: 'Cliente A' })).json();
  await criarPedido({ cliente: 'Cliente B' });

  await fetch(`${base}/api/pedidos/${primeiro.id}`, { method: 'DELETE' });
  const pedidos = await (await fetch(`${base}/api/pedidos`)).json();

  assert.equal(pedidos.length, 1);
  assert.equal(pedidos[0].cliente, 'Cliente B');
});

// ---------------------------------------------------------------------------
// Painel web e rotas desconhecidas
// ---------------------------------------------------------------------------

test('GET / entrega o painel web', async () => {
  const resposta = await fetch(`${base}/`);

  assert.equal(resposta.status, 200);
  assert.ok(resposta.headers.get('content-type').includes('text/html'));
  assert.ok((await resposta.text()).includes('TechNova Pedidos'));
});

test('rota desconhecida responde 404 em JSON', async () => {
  const resposta = await fetch(`${base}/api/inexistente`);

  assert.equal(resposta.status, 404);
  assert.deepEqual(await resposta.json(), { erro: 'Rota nao encontrada.' });
});

test('metodo nao suportado na rota de pedidos responde 404', async () => {
  const resposta = await fetch(`${base}/api/pedidos/1`, { method: 'PUT' });

  assert.equal(resposta.status, 404);
});
