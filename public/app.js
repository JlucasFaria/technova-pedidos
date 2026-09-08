const lista = document.getElementById('lista');
const contador = document.getElementById('contador');
const aviso = document.getElementById('aviso');
const formulario = document.getElementById('form-pedido');

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/**
 * Escapa o conteudo vindo da API antes de injetar na tabela.
 * Sem isso, um pedido cadastrado com HTML no nome do cliente seria executado
 * no navegador de quem abre o painel (XSS armazenado).
 */
function escapar(valor) {
  return String(valor).replace(/[&<>"']/g, (caractere) => ESCAPES[caractere]);
}

function mostrarAviso(texto, tipo) {
  aviso.className = `aviso ${tipo}`;
  aviso.textContent = texto;
}

async function carregarSaude() {
  try {
    const resposta = await fetch('/api/health');
    const dados = await resposta.json();
    document.getElementById('saude').textContent =
      `v${dados.versao} | banco: ${dados.banco.modo}`;
  } catch {
    document.getElementById('saude').textContent = 'API indisponivel';
  }
}

async function carregarPedidos() {
  try {
    const resposta = await fetch('/api/pedidos');
    if (!resposta.ok) {
      throw new Error('resposta invalida');
    }
    const pedidos = await resposta.json();

    contador.textContent = `${pedidos.length} pedido(s)`;
    lista.innerHTML = pedidos
      .map(
        (pedido) => `
        <tr>
          <td>${escapar(pedido.id)}</td>
          <td>${escapar(pedido.cliente)}</td>
          <td>${escapar(pedido.produto)}</td>
          <td>${escapar(pedido.quantidade)}</td>
          <td>${escapar(moeda.format(pedido.quantidade * pedido.valorUnitario))}</td>
          <td><span class="etiqueta ${escapar(pedido.status)}">${escapar(pedido.status)}</span></td>
          <td><button class="acao" data-id="${escapar(pedido.id)}">excluir</button></td>
        </tr>`
      )
      .join('');
  } catch {
    contador.textContent = '-';
    mostrarAviso('Nao foi possivel carregar os pedidos.', 'erro');
  }
}

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const dados = Object.fromEntries(new FormData(formulario).entries());

  try {
    const resposta = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    if (resposta.ok) {
      mostrarAviso('Pedido cadastrado com sucesso.', 'ok');
      formulario.reset();
      await carregarPedidos();
      return;
    }

    const erro = await resposta.json();
    mostrarAviso((erro.erros || [erro.erro]).join(' '), 'erro');
  } catch {
    mostrarAviso('Nao foi possivel falar com a API.', 'erro');
  }
});

lista.addEventListener('click', async (evento) => {
  const botao = evento.target.closest('button[data-id]');
  if (!botao) return;

  botao.disabled = true;
  try {
    const resposta = await fetch(`/api/pedidos/${encodeURIComponent(botao.dataset.id)}`, {
      method: 'DELETE'
    });
    if (!resposta.ok) {
      throw new Error('falha na exclusao');
    }
    await carregarPedidos();
  } catch {
    botao.disabled = false;
    mostrarAviso('Nao foi possivel excluir o pedido.', 'erro');
  }
});

carregarSaude();
carregarPedidos();
