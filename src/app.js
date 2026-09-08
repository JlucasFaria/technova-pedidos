'use strict';

const path = require('path');
const express = require('express');
const pedidosRouter = require('./routes/pedidos');
const { healthCheck } = require('./db');

// A versao exibida no /api/health vem do package.json para nao ficar desatualizada.
const { version: VERSAO } = require('../package.json');

const app = express();

// Limite de corpo para evitar que uma requisicao gigante consuma memoria do processo.
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', async (_req, res) => {
  try {
    const banco = await healthCheck();
    res.json({
      status: 'ok',
      servico: 'technova-pedidos',
      versao: process.env.APP_VERSION || VERSAO,
      banco,
      horario: new Date().toISOString()
    });
  } catch (erro) {
    // A mensagem original pode conter usuario/host do banco: fica so no log.
    console.error('[health]', erro.message);
    res.status(503).json({ status: 'indisponivel', detalhe: 'Banco de dados indisponivel.' });
  }
});

app.use('/api/pedidos', pedidosRouter);

app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota nao encontrada.' });
});

// eslint-disable-next-line no-unused-vars
app.use((erro, _req, res, _next) => {
  // Erros do express.json (JSON malformado, corpo acima do limite) ja trazem o
  // status correto: sao problemas da requisicao, nao falhas do servidor.
  const status = Number(erro.status || erro.statusCode) || 500;

  if (status < 500) {
    return res.status(status).json({ erro: 'Corpo da requisicao invalido.' });
  }

  console.error('[erro]', erro.message);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

module.exports = app;
