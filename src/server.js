'use strict';

const app = require('./app');
const { close: fecharBanco } = require('./db');

const PORTA = process.env.PORT || 3000;
const TEMPO_LIMITE_ENCERRAMENTO = 10000;

const servidor = app.listen(PORTA, () => {
  console.log(`[technova-pedidos] API disponivel em http://localhost:${PORTA}`);
});

servidor.on('error', (erro) => {
  if (erro.code === 'EADDRINUSE') {
    console.error(
      `[technova-pedidos] A porta ${PORTA} ja esta em uso.\n` +
        '  Verifique se a aplicacao ja esta rodando (docker compose ps) ou\n' +
        `  inicie em outra porta: PORT=3001 npm start`
    );
    process.exit(1);
  }

  if (erro.code === 'EACCES') {
    console.error(`[technova-pedidos] Sem permissao para usar a porta ${PORTA}.`);
    process.exit(1);
  }

  throw erro;
});

let encerrando = false;

function encerrar(sinal) {
  if (encerrando) {
    return;
  }
  encerrando = true;
  console.log(`[technova-pedidos] Recebido ${sinal}, encerrando o servidor...`);

  // Rede de seguranca: se alguma conexao travar, o processo sai mesmo assim.
  const limite = setTimeout(() => {
    console.error('[technova-pedidos] Encerramento forcado por tempo limite.');
    process.exit(1);
  }, TEMPO_LIMITE_ENCERRAMENTO);
  limite.unref();

  servidor.close(async () => {
    try {
      await fecharBanco();
    } catch (erro) {
      console.error('[technova-pedidos] Falha ao fechar o pool do banco:', erro.message);
    }
    process.exit(0);
  });
}

process.on('SIGTERM', () => encerrar('SIGTERM'));
process.on('SIGINT', () => encerrar('SIGINT'));

module.exports = servidor;
