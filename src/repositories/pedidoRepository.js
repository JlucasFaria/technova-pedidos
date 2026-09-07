'use strict';

const { isPostgresEnabled, getPool } = require('../db');

/** Armazenamento em memoria utilizado quando o Postgres nao esta configurado. */
const memoria = {
  registros: [],
  sequencia: 0
};

const STATUS_VALIDOS = ['pendente', 'pago', 'enviado', 'entregue', 'cancelado'];

function normalizar(linha) {
  return {
    id: Number(linha.id),
    cliente: linha.cliente,
    produto: linha.produto,
    quantidade: Number(linha.quantidade),
    valorUnitario: Number(linha.valor_unitario ?? linha.valorUnitario),
    status: linha.status,
    criadoEm: linha.criado_em ?? linha.criadoEm
  };
}

async function listar() {
  if (!isPostgresEnabled()) {
    return memoria.registros.map(normalizar);
  }

  const { rows } = await getPool().query(
    'SELECT id, cliente, produto, quantidade, valor_unitario, status, criado_em FROM pedidos ORDER BY id'
  );
  return rows.map(normalizar);
}

async function buscarPorId(id) {
  if (!isPostgresEnabled()) {
    const encontrado = memoria.registros.find((pedido) => pedido.id === Number(id));
    return encontrado ? normalizar(encontrado) : null;
  }

  const { rows } = await getPool().query(
    'SELECT id, cliente, produto, quantidade, valor_unitario, status, criado_em FROM pedidos WHERE id = $1',
    [id]
  );
  return rows.length ? normalizar(rows[0]) : null;
}

async function criar(dados) {
  const registro = {
    cliente: dados.cliente,
    produto: dados.produto,
    quantidade: Number(dados.quantidade),
    valorUnitario: Number(dados.valorUnitario),
    status: dados.status || 'pendente',
    criadoEm: new Date().toISOString()
  };

  if (!isPostgresEnabled()) {
    memoria.sequencia += 1;
    const novo = { id: memoria.sequencia, ...registro };
    memoria.registros.push(novo);
    return normalizar(novo);
  }

  const { rows } = await getPool().query(
    `INSERT INTO pedidos (cliente, produto, quantidade, valor_unitario, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, cliente, produto, quantidade, valor_unitario, status, criado_em`,
    [registro.cliente, registro.produto, registro.quantidade, registro.valorUnitario, registro.status]
  );
  return normalizar(rows[0]);
}

async function atualizarStatus(id, status) {
  if (!isPostgresEnabled()) {
    const pedido = memoria.registros.find((item) => item.id === Number(id));
    if (!pedido) {
      return null;
    }
    pedido.status = status;
    return normalizar(pedido);
  }

  const { rows } = await getPool().query(
    `UPDATE pedidos SET status = $2 WHERE id = $1
     RETURNING id, cliente, produto, quantidade, valor_unitario, status, criado_em`,
    [id, status]
  );
  return rows.length ? normalizar(rows[0]) : null;
}

async function remover(id) {
  if (!isPostgresEnabled()) {
    const indice = memoria.registros.findIndex((item) => item.id === Number(id));
    if (indice === -1) {
      return false;
    }
    memoria.registros.splice(indice, 1);
    return true;
  }

  const resultado = await getPool().query('DELETE FROM pedidos WHERE id = $1', [id]);
  return resultado.rowCount > 0;
}

/** Utilizado pelos testes automatizados para garantir isolamento entre casos. */
function limparMemoria() {
  memoria.registros = [];
  memoria.sequencia = 0;
}

module.exports = {
  STATUS_VALIDOS,
  listar,
  buscarPorId,
  criar,
  atualizarStatus,
  remover,
  limparMemoria
};
