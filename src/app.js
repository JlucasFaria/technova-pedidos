'use strict';

const express = require('express');
const pedidosRouter = require('./routes/pedidos');
const { healthCheck } = require('./db');

const app = express();

app.use(express.json());

app.get('/api/health', async (_req, res) => {
  res.json({
    status: 'ok',
    servico: 'technova-pedidos',
    versao: process.env.APP_VERSION || '1.0.0'
  });
});

app.use('/api/pedidos', pedidosRouter);

app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota nao encontrada.' });
});

// eslint-disable-next-line no-unused-vars
app.use((erro, _req, res, _next) => {
  console.error('[erro]', erro.message);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

module.exports = app;
