'use strict';

/** Status permitidos para um pedido. Regra de dominio, usada tambem pelas rotas. */
const STATUS_VALIDOS = ['pendente', 'pago', 'enviado', 'entregue', 'cancelado'];

/** Limite dos campos de texto, alinhado ao VARCHAR(120) definido em db/init.sql. */
const TAMANHO_MAXIMO_TEXTO = 120;

/** Teto de quantidade e de valor, alinhado ao NUMERIC(10,2) definido em db/init.sql. */
const QUANTIDADE_MAXIMA = 1000000;
const VALOR_MAXIMO = 99999999.99;

/**
 * Aceita apenas texto de verdade. Objetos, arrays e numeros sao recusados para
 * evitar que valores como {"a":1} cheguem ao banco convertidos em texto.
 */
function textoValido(valor, minimo) {
  if (typeof valor !== 'string') {
    return false;
  }
  const limpo = valor.trim();
  return limpo.length >= minimo && limpo.length <= TAMANHO_MAXIMO_TEXTO;
}

/** Aceita numero finito ou string numerica; recusa array, objeto, booleano e vazio. */
function numeroValido(valor) {
  if (typeof valor === 'number') {
    return Number.isFinite(valor);
  }
  if (typeof valor === 'string' && valor.trim() !== '') {
    return Number.isFinite(Number(valor));
  }
  return false;
}

/**
 * Valida o corpo de criacao de um pedido.
 * Retorna a lista de erros encontrados (vazia quando o pedido e valido).
 */
function validarPedido(corpo) {
  if (!corpo || typeof corpo !== 'object' || Array.isArray(corpo)) {
    return ['O corpo da requisicao deve ser um objeto JSON.'];
  }

  const erros = [];

  if (!textoValido(corpo.cliente, 3)) {
    erros.push(
      `O campo "cliente" e obrigatorio e deve ser um texto de 3 a ${TAMANHO_MAXIMO_TEXTO} caracteres.`
    );
  }

  if (!textoValido(corpo.produto, 2)) {
    erros.push(
      `O campo "produto" e obrigatorio e deve ser um texto de 2 a ${TAMANHO_MAXIMO_TEXTO} caracteres.`
    );
  }

  const quantidade = Number(corpo.quantidade);
  if (
    !numeroValido(corpo.quantidade) ||
    !Number.isInteger(quantidade) ||
    quantidade <= 0 ||
    quantidade > QUANTIDADE_MAXIMA
  ) {
    erros.push(
      `O campo "quantidade" deve ser um numero inteiro entre 1 e ${QUANTIDADE_MAXIMA}.`
    );
  }

  const valorUnitario = Number(corpo.valorUnitario);
  if (!numeroValido(corpo.valorUnitario) || valorUnitario <= 0 || valorUnitario > VALOR_MAXIMO) {
    erros.push(
      `O campo "valorUnitario" deve ser um numero maior que zero e menor ou igual a ${VALOR_MAXIMO}.`
    );
  }

  if (corpo.status !== undefined && !validarStatus(corpo.status)) {
    erros.push(`O campo "status" deve ser um dos valores: ${STATUS_VALIDOS.join(', ')}.`);
  }

  return erros;
}

function validarStatus(status) {
  return STATUS_VALIDOS.includes(status);
}

/**
 * O identificador vem da URL como texto. Aceitamos apenas inteiros positivos
 * dentro do limite do SERIAL do Postgres, para que um id invalido vire 404 em
 * vez de estourar uma consulta no banco.
 */
function validarId(id) {
  return /^\d+$/.test(String(id)) && Number(id) > 0 && Number(id) <= 2147483647;
}

module.exports = {
  STATUS_VALIDOS,
  TAMANHO_MAXIMO_TEXTO,
  QUANTIDADE_MAXIMA,
  VALOR_MAXIMO,
  validarPedido,
  validarStatus,
  validarId
};
