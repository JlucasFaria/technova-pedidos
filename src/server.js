'use strict';

const app = require('./app');

const PORTA = process.env.PORT || 3000;

const servidor = app.listen(PORTA, () => {
  console.log(`[technova-pedidos] API disponivel em http://localhost:${PORTA}`);
});

function encerrar(sinal) {
  console.log(`[technova-pedidos] Recebido ${sinal}, encerrando o servidor...`);
  servidor.close(() => process.exit(0));
}

process.on('SIGTERM', () => encerrar('SIGTERM'));
process.on('SIGINT', () => encerrar('SIGINT'));

module.exports = servidor;
