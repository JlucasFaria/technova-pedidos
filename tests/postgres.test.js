'use strict';

/**
 * Testes de integracao executados contra um PostgreSQL de verdade.
 *
 * Toda a suite anterior exercitava apenas o modo memoria, e foi justamente por
 * isso que alguns defeitos passaram despercebidos: consultas com identificador
 * invalido e valores acima do tamanho das colunas so falham no banco real.
 *
 * Sem a variavel DATABASE_URL definida, os testes sao ignorados - assim o
 * `npm test` continua rodando em qualquer maquina, sem exigir banco.
 * No pipeline, o job "Testes de integracao com PostgreSQL" define a variavel.
 */

const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const TEM_POSTGRES = Boolean(process.env.DATABASE_URL);
const ignorar = TEM_POSTGRES ? false : 'DATABASE_URL nao definida';

const app = require('../src/app');
const { getPool, close } = require('../src/db');

let servidor;
let base;

before(async () => {
  if (!TEM_POSTGRES) {
    return;
  }

  // Cria o schema com o mesmo script que o container do banco utiliza.
  const script = fs.readFileSync(path.join(__dirname, '..', 'db', 'init.sql'), 'utf8');
  await getPool().query(script);

  servidor = app.listen(0);
  await new Promise((resolve) => servidor.once('listening', resolve));
  base = `http://127.0.0.1:${servidor.address().port}`;
});

beforeEach(async () => {
  if (!TEM_POSTGRES) {
    return;
  }
  await getPool().query('TRUNCATE pedidos RESTART IDENTITY');
});

after(async () => {
  if (!TEM_POSTGRES) {
    return;
  }
  servidor.close();
  await close();
});

function criarPedido(dados = {}) {
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

test('o health confirma a conexao com o PostgreSQL', { skip: ignorar }, async () => {
  const corpo = await (await fetch(`${base}/api/health`)).json();

  assert.equal(corpo.status, 'ok');
  assert.deepEqual(corpo.banco, { modo: 'postgres', conectado: true });
});

test('o ciclo completo do pedido funciona no banco real', { skip: ignorar }, async () => {
  const criado = await (await criarPedido()).json();
  assert.ok(criado.id > 0);
  assert.equal(criado.status, 'pendente');

  const consultado = await (await fetch(`${base}/api/pedidos/${criado.id}`)).json();
  assert.deepEqual(consultado, criado);

  const atualizado = await (
    await fetch(`${base}/api/pedidos/${criado.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'pago' })
    })
  ).json();
  assert.equal(atualizado.status, 'pago');

  const remocao = await fetch(`${base}/api/pedidos/${criado.id}`, { method: 'DELETE' });
  assert.equal(remocao.status, 204);

  const lista = await (await fetch(`${base}/api/pedidos`)).json();
  assert.deepEqual(lista, []);
});

test('os tipos numericos voltam do banco como numero', { skip: ignorar }, async () => {
  // O driver devolve NUMERIC como texto; a camada de dados precisa converter.
  const pedido = await (await criarPedido({ quantidade: 3, valorUnitario: 99.9 })).json();

  assert.equal(typeof pedido.quantidade, 'number');
  assert.equal(typeof pedido.valorUnitario, 'number');
  assert.equal(pedido.valorUnitario, 99.9);
});

test('identificador invalido responde 404 e nao quebra a consulta', { skip: ignorar }, async () => {
  // Regressao: antes o PostgreSQL respondia "invalid input syntax for type
  // integer" e a API devolvia 500.
  for (const id of ['abc', '1abc', '-1', '9999999999999']) {
    const resposta = await fetch(`${base}/api/pedidos/${id}`);
    assert.equal(resposta.status, 404, `id "${id}" deveria responder 404`);
  }
});

test('texto acima do VARCHAR(120) e recusado pela validacao', { skip: ignorar }, async () => {
  // Regressao: antes chegava ao banco e estourava a coluna.
  const resposta = await criarPedido({ cliente: 'x'.repeat(121) });

  assert.equal(resposta.status, 400);
});

test('valor acima do NUMERIC(10,2) e recusado pela validacao', { skip: ignorar }, async () => {
  const resposta = await criarPedido({ valorUnitario: 100000000 });

  assert.equal(resposta.status, 400);
});

test('a listagem respeita a ordem dos identificadores', { skip: ignorar }, async () => {
  await criarPedido({ cliente: 'Cliente A' });
  await criarPedido({ cliente: 'Cliente B' });
  await criarPedido({ cliente: 'Cliente C' });

  const pedidos = await (await fetch(`${base}/api/pedidos`)).json();

  assert.deepEqual(
    pedidos.map((pedido) => pedido.cliente),
    ['Cliente A', 'Cliente B', 'Cliente C']
  );
});

test('o script db/init.sql cria a tabela com as restricoes', { skip: ignorar }, async () => {
  const { rows } = await getPool().query(
    `SELECT column_name, data_type, character_maximum_length
     FROM information_schema.columns
     WHERE table_name = 'pedidos'
     ORDER BY ordinal_position`
  );

  const colunas = rows.map((linha) => linha.column_name);
  assert.deepEqual(colunas, [
    'id',
    'cliente',
    'produto',
    'quantidade',
    'valor_unitario',
    'status',
    'criado_em'
  ]);
  assert.equal(rows.find((l) => l.column_name === 'cliente').character_maximum_length, 120);
});
