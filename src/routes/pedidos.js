'use strict';

const express = require('express');
const repositorio = require('../repositories/pedidoRepository');
const {
  STATUS_VALIDOS,
  validarPedido,
  validarStatus,
  validarId
} = require('../validators/pedidoValidator');

const router = express.Router();

const NAO_ENCONTRADO = { erro: 'Pedido nao encontrado.' };

router.get('/', async (_req, res, next) => {
  try {
    res.json(await repositorio.listar());
  } catch (erro) {
    next(erro);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!validarId(req.params.id)) {
      return res.status(404).json(NAO_ENCONTRADO);
    }
    const pedido = await repositorio.buscarPorId(req.params.id);
    if (!pedido) {
      return res.status(404).json(NAO_ENCONTRADO);
    }
    res.json(pedido);
  } catch (erro) {
    next(erro);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const erros = validarPedido(req.body);
    if (erros.length) {
      return res.status(400).json({ erros });
    }
    const pedido = await repositorio.criar(req.body);
    res.status(201).json(pedido);
  } catch (erro) {
    next(erro);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!validarStatus(status)) {
      return res.status(400).json({
        erro: `Status invalido. Use um dos valores: ${STATUS_VALIDOS.join(', ')}.`
      });
    }
    if (!validarId(req.params.id)) {
      return res.status(404).json(NAO_ENCONTRADO);
    }
    const pedido = await repositorio.atualizarStatus(req.params.id, status);
    if (!pedido) {
      return res.status(404).json(NAO_ENCONTRADO);
    }
    res.json(pedido);
  } catch (erro) {
    next(erro);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!validarId(req.params.id)) {
      return res.status(404).json(NAO_ENCONTRADO);
    }
    const removido = await repositorio.remover(req.params.id);
    if (!removido) {
      return res.status(404).json(NAO_ENCONTRADO);
    }
    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
});

module.exports = router;
