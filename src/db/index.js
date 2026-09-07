'use strict';

/**
 * Camada de acesso a dados.
 *
 * A aplicacao funciona em dois modos:
 *  - memoria: usado em desenvolvimento e nos testes automatizados (sem dependencia externa);
 *  - postgres: usado quando a variavel DATABASE_URL esta definida (docker-compose).
 *
 * Isso permite que o pipeline de CI rode os testes sem subir um banco de dados.
 */

const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

let pool = null;

function isPostgresEnabled() {
  return Boolean(connectionString);
}

function getPool() {
  if (!isPostgresEnabled()) {
    return null;
  }

  if (!pool) {
    pool = new Pool({ connectionString });
  }

  return pool;
}

async function healthCheck() {
  if (!isPostgresEnabled()) {
    return { modo: 'memoria', conectado: true };
  }

  await getPool().query('SELECT 1');
  return { modo: 'postgres', conectado: true };
}

async function close() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = { isPostgresEnabled, getPool, healthCheck, close };
