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

test('GET /api/health responde com status ok', async () => {
  const resposta = await fetch(`${base}/api/health`);
  const corpo = await resposta.json();

  assert.equal(resposta.status, 200);
  assert.equal(corpo.status, 'ok');
  assert.equal(corpo.servico, 'technova-pedidos');
});

test('GET /api/pedidos comeca com a lista vazia', async () => {
  const resposta = await fetch(`${base}/api/pedidos`);

  assert.equal(resposta.status, 200);
  assert.deepEqual(await resposta.json(), []);
});

test('POST /api/pedidos cria um pedido valido', async () => {
  const resposta = await criarPedido();
  const pedido = await resposta.json();

  assert.equal(resposta.status, 201);
  assert.equal(pedido.cliente, 'Mercado Sao Jorge');
  assert.equal(pedido.status, 'pendente');
  assert.ok(pedido.id > 0);
});

test('GET /api/pedidos/:id inexistente retorna 404', async () => {
  const resposta = await fetch(`${base}/api/pedidos/999`);

  assert.equal(resposta.status, 404);
});
