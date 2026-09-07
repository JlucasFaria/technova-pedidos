'use strict';

const express = require('express');
const repositorio = require('../repositories/pedidoRepository');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    res.json(await repositorio.listar());
  } catch (erro) {
    next(erro);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const pedido = await repositorio.buscarPorId(req.params.id);
    if (!pedido) {
      return res.status(404).json({ erro: 'Pedido nao encontrado.' });
    }
    res.json(pedido);
  } catch (erro) {
    next(erro);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const pedido = await repositorio.criar(req.body);
    res.status(201).json(pedido);
  } catch (erro) {
    next(erro);
  }
});

module.exports = router;
