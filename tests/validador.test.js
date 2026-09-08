'use strict';

// Testes de unidade das regras de validacao, sem subir o servidor HTTP.

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  STATUS_VALIDOS,
  TAMANHO_MAXIMO_TEXTO,
  QUANTIDADE_MAXIMA,
  VALOR_MAXIMO,
  validarPedido,
  validarStatus,
  validarId
} = require('../src/validators/pedidoValidator');

const PEDIDO_VALIDO = {
  cliente: 'Mercado Sao Jorge',
  produto: 'Licenca ERP',
  quantidade: 2,
  valorUnitario: 150.5
};

function comCampo(campo, valor) {
  return validarPedido({ ...PEDIDO_VALIDO, [campo]: valor });
}

test('validarPedido aceita um pedido completo e valido', () => {
  assert.deepEqual(validarPedido(PEDIDO_VALIDO), []);
});

test('validarPedido aceita pedido com status inicial permitido', () => {
  for (const status of STATUS_VALIDOS) {
    assert.deepEqual(comCampo('status', status), []);
  }
});

test('validarPedido recusa corpo que nao e objeto', () => {
  for (const corpo of [undefined, null, 'texto', 10, [1, 2]]) {
    assert.equal(validarPedido(corpo).length, 1, `corpo ${JSON.stringify(corpo)} deveria ser recusado`);
  }
});

test('validarPedido exige cliente com ao menos 3 caracteres uteis', () => {
  assert.equal(comCampo('cliente', 'ab').length, 1);
  assert.equal(comCampo('cliente', '   ').length, 1);
  assert.deepEqual(comCampo('cliente', 'abc'), []);
});

test('validarPedido exige produto com ao menos 2 caracteres uteis', () => {
  assert.equal(comCampo('produto', 'a').length, 1);
  assert.deepEqual(comCampo('produto', 'ab'), []);
});

test('validarPedido limita os textos ao tamanho da coluna do banco', () => {
  assert.deepEqual(comCampo('cliente', 'x'.repeat(TAMANHO_MAXIMO_TEXTO)), []);
  assert.equal(comCampo('cliente', 'x'.repeat(TAMANHO_MAXIMO_TEXTO + 1)).length, 1);
  assert.equal(comCampo('produto', 'x'.repeat(TAMANHO_MAXIMO_TEXTO + 1)).length, 1);
});

test('validarPedido recusa textos que nao sao string', () => {
  for (const valor of [{ nome: 'Loja' }, ['Loja'], 123, true, null, undefined]) {
    assert.equal(comCampo('cliente', valor).length, 1, `cliente ${JSON.stringify(valor)}`);
  }
});

test('validarPedido exige quantidade inteira e positiva', () => {
  for (const valor of [0, -1, 1.5, '1.5', NaN, 'dois', '', ' ', null, undefined, true, [2], {}]) {
    assert.equal(comCampo('quantidade', valor).length, 1, `quantidade ${JSON.stringify(valor)}`);
  }
  assert.deepEqual(comCampo('quantidade', 1), []);
  assert.deepEqual(comCampo('quantidade', '7'), []);
});

test('validarPedido limita a quantidade ao teto definido', () => {
  assert.deepEqual(comCampo('quantidade', QUANTIDADE_MAXIMA), []);
  assert.equal(comCampo('quantidade', QUANTIDADE_MAXIMA + 1).length, 1);
});

test('validarPedido exige valor unitario positivo', () => {
  for (const valor of [0, -0.01, NaN, 'gratis', '', null, undefined, true, [5], {}]) {
    assert.equal(comCampo('valorUnitario', valor).length, 1, `valorUnitario ${JSON.stringify(valor)}`);
  }
  assert.deepEqual(comCampo('valorUnitario', 0.01), []);
  assert.deepEqual(comCampo('valorUnitario', '10.50'), []);
});

test('validarPedido limita o valor unitario ao NUMERIC(10,2) do banco', () => {
  assert.deepEqual(comCampo('valorUnitario', VALOR_MAXIMO), []);
  assert.equal(comCampo('valorUnitario', VALOR_MAXIMO + 1).length, 1);
});

test('validarPedido recusa numeros infinitos enviados como texto', () => {
  assert.equal(comCampo('quantidade', '1e400').length, 1);
  assert.equal(comCampo('valorUnitario', 'Infinity').length, 1);
});

test('validarPedido recusa status fora da lista', () => {
  assert.equal(comCampo('status', 'arquivado').length, 1);
  assert.equal(comCampo('status', '').length, 1);
  assert.equal(comCampo('status', null).length, 1);
});

test('validarPedido acumula um erro por campo invalido', () => {
  const erros = validarPedido({ cliente: '', produto: '', quantidade: 0, valorUnitario: 0, status: 'x' });

  assert.equal(erros.length, 5);
});

test('validarStatus aceita apenas os status do dominio', () => {
  for (const status of STATUS_VALIDOS) {
    assert.equal(validarStatus(status), true);
  }
  for (const status of ['arquivado', 'PAGO', '', null, undefined, 'constructor', 'toString']) {
    assert.equal(validarStatus(status), false, `status ${String(status)}`);
  }
});

test('validarId aceita apenas inteiros positivos dentro do limite do banco', () => {
  for (const id of ['1', '42', '2147483647', 7]) {
    assert.equal(validarId(id), true, `id ${id}`);
  }
  for (const id of ['0', '-1', '1.5', 'abc', '1abc', '', ' ', '2147483648', null, undefined]) {
    assert.equal(validarId(id), false, `id ${String(id)}`);
  }
});
