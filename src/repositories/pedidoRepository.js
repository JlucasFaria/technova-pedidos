'use strict';

/** Armazenamento em memoria dos pedidos. */
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
    valorUnitario: Number(linha.valorUnitario),
    status: linha.status,
    criadoEm: linha.criadoEm
  };
}

async function listar() {
  return memoria.registros.map(normalizar);
}

async function buscarPorId(id) {
  const encontrado = memoria.registros.find((pedido) => pedido.id === Number(id));
  return encontrado ? normalizar(encontrado) : null;
}

async function criar(dados) {
  memoria.sequencia += 1;

  const novo = {
    id: memoria.sequencia,
    cliente: dados.cliente,
    produto: dados.produto,
    quantidade: Number(dados.quantidade),
    valorUnitario: Number(dados.valorUnitario),
    status: dados.status || 'pendente',
    criadoEm: new Date().toISOString()
  };

  memoria.registros.push(novo);
  return normalizar(novo);
}

async function atualizarStatus(id, status) {
  const pedido = memoria.registros.find((item) => item.id === Number(id));
  if (!pedido) {
    return null;
  }
  pedido.status = status;
  return normalizar(pedido);
}

async function remover(id) {
  const indice = memoria.registros.findIndex((item) => item.id === Number(id));
  if (indice === -1) {
    return false;
  }
  memoria.registros.splice(indice, 1);
  return true;
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
