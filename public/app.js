const lista = document.getElementById('lista');
const contador = document.getElementById('contador');
const aviso = document.getElementById('aviso');
const formulario = document.getElementById('form-pedido');

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

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
  const resposta = await fetch('/api/pedidos');
  const pedidos = await resposta.json();

  contador.textContent = `${pedidos.length} pedido(s)`;
  lista.innerHTML = pedidos
    .map(
      (pedido) => `
      <tr>
        <td>${pedido.id}</td>
        <td>${pedido.cliente}</td>
        <td>${pedido.produto}</td>
        <td>${pedido.quantidade}</td>
        <td>${moeda.format(pedido.quantidade * pedido.valorUnitario)}</td>
        <td><span class="etiqueta ${pedido.status}">${pedido.status}</span></td>
        <td><button class="acao" data-id="${pedido.id}">excluir</button></td>
      </tr>`
    )
    .join('');
}

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const dados = Object.fromEntries(new FormData(formulario).entries());

  const resposta = await fetch('/api/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });

  if (resposta.ok) {
    aviso.className = 'aviso ok';
    aviso.textContent = 'Pedido cadastrado com sucesso.';
    formulario.reset();
    await carregarPedidos();
  } else {
    const erro = await resposta.json();
    aviso.className = 'aviso erro';
    aviso.textContent = (erro.erros || [erro.erro]).join(' ');
  }
});

lista.addEventListener('click', async (evento) => {
  const botao = evento.target.closest('button[data-id]');
  if (!botao) return;
  await fetch(`/api/pedidos/${botao.dataset.id}`, { method: 'DELETE' });
  await carregarPedidos();
});

carregarSaude();
carregarPedidos();
