'use strict';

const { STATUS_VALIDOS } = require('../repositories/pedidoRepository');

/**
 * Valida o corpo de criacao de um pedido.
 * Retorna a lista de erros encontrados (vazia quando o pedido e valido).
 */
function validarPedido(corpo = {}) {
  const erros = [];

  if (!corpo.cliente || String(corpo.cliente).trim().length < 3) {
    erros.push('O campo "cliente" e obrigatorio e deve ter ao menos 3 caracteres.');
  }

  if (!corpo.produto || String(corpo.produto).trim().length < 2) {
    erros.push('O campo "produto" e obrigatorio e deve ter ao menos 2 caracteres.');
  }

  if (!Number.isInteger(Number(corpo.quantidade)) || Number(corpo.quantidade) < 0) {
    erros.push('O campo "quantidade" deve ser um numero inteiro maior que zero.');
  }

  if (Number.isNaN(Number(corpo.valorUnitario)) || Number(corpo.valorUnitario) <= 0) {
    erros.push('O campo "valorUnitario" deve ser um numero maior que zero.');
  }

  if (corpo.status && !STATUS_VALIDOS.includes(corpo.status)) {
    erros.push(`O campo "status" deve ser um dos valores: ${STATUS_VALIDOS.join(', ')}.`);
  }

  return erros;
}

function validarStatus(status) {
  return STATUS_VALIDOS.includes(status);
}

module.exports = { validarPedido, validarStatus };
