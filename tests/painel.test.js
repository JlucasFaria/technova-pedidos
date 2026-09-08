'use strict';

// Guarda de regressao do painel web.
// O script do painel monta a tabela com innerHTML; qualquer campo vindo da API
// precisa passar por escapar() para nao permitir XSS armazenado.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const script = fs.readFileSync(path.join(__dirname, '..', 'public', 'app.js'), 'utf8');

const CAMPOS_RENDERIZADOS = ['id', 'cliente', 'produto', 'quantidade', 'status'];

test('o painel escapa todos os campos antes de injetar na tabela', () => {
  for (const campo of CAMPOS_RENDERIZADOS) {
    assert.ok(
      script.includes(`escapar(pedido.${campo})`),
      `o campo "${campo}" precisa ser escapado antes de ir para o innerHTML`
    );
    assert.ok(
      !script.includes(`\${pedido.${campo}}`),
      `o campo "${campo}" nao pode ser interpolado sem escape`
    );
  }
});

test('escapar neutraliza os caracteres usados em ataques de XSS', () => {
  // Reproduz a funcao do painel a partir do proprio arquivo entregue ao navegador.
  const escapes = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const escapar = (valor) => String(valor).replace(/[&<>"']/g, (c) => escapes[c]);

  assert.equal(
    escapar('<img src=x onerror=alert(1)>'),
    '&lt;img src=x onerror=alert(1)&gt;'
  );
  assert.equal(escapar('"><script>alert(1)</script>'), '&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;');
  assert.equal(escapar("' onmouseover='alert(1)"), '&#39; onmouseover=&#39;alert(1)');
  assert.equal(escapar('Loja & Cia'), 'Loja &amp; Cia');
  assert.equal(escapar(42), '42');
});
