'use strict';

/**
 * Camada de acesso a dados.
 * Nesta primeira versao a aplicacao utiliza apenas armazenamento em memoria,
 * suficiente para o desenvolvimento e para os testes automatizados.
 */

async function healthCheck() {
  return { modo: 'memoria', conectado: true };
}

module.exports = { healthCheck };
