'use strict';

/**
 * Verificacao de sintaxe de todos os arquivos JavaScript do projeto.
 *
 * Usado pela etapa "Analisar a sintaxe dos arquivos" do pipeline de CI.
 * A versao anterior checava apenas dois arquivos fixos, entao qualquer arquivo
 * novo passava sem verificacao. Aqui a lista e descoberta automaticamente.
 */

const { execFileSync } = require('node:child_process');
const { readdirSync } = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');
const PASTAS = ['src', 'public', 'tests', 'scripts'];

function listarArquivos(pasta) {
  return readdirSync(pasta, { withFileTypes: true }).flatMap((item) => {
    const caminho = path.join(pasta, item.name);
    if (item.isDirectory()) {
      return listarArquivos(caminho);
    }
    return item.name.endsWith('.js') ? [caminho] : [];
  });
}

const arquivos = PASTAS.flatMap((pasta) => listarArquivos(path.join(RAIZ, pasta)));
const falhas = [];

for (const arquivo of arquivos) {
  const relativo = path.relative(RAIZ, arquivo);
  try {
    execFileSync(process.execPath, ['--check', arquivo], { stdio: 'pipe' });
    console.log(`ok   ${relativo}`);
  } catch (erro) {
    falhas.push(relativo);
    console.error(`FALHA ${relativo}`);
    console.error(String(erro.stderr));
  }
}

console.log(`\n${arquivos.length} arquivo(s) verificado(s), ${falhas.length} com erro.`);

if (falhas.length) {
  process.exit(1);
}
