/* =========================================================
   utils.js — Helpers compartilhados entre páginas
   ========================================================= */

function formatMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function aplicarTemaLoja(loja) {
  if (!loja) return;
  document.documentElement.style.setProperty('--brand', loja.corPrimaria || '#FF6B35');
  document.documentElement.style.setProperty('--brand-dark', loja.corSecundaria || '#1A1A1A');
  const rgb = hexToRgb(loja.corPrimaria || '#FF6B35');
  document.documentElement.style.setProperty('--brand-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
}

function hexToRgb(hex) {
  const m = hex.replace('#', '').match(/.{1,2}/g);
  return { r: parseInt(m[0], 16), g: parseInt(m[1], 16), b: parseInt(m[2], 16) };
}

let toastWrap = null;
function toast(msg, opts = {}) {
  if (!toastWrap) {
    toastWrap = document.createElement('div');
    toastWrap.className = 'toast-wrap';
    document.body.appendChild(toastWrap);
  }
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="icon-inline-row">${opts.icon || Icon.check({size: 16})}</span><span>${msg}</span>`;
  toastWrap.appendChild(el);
  setTimeout(() => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 300);
  }, opts.duration || 2200);
}

function addRipple(e) {
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = size + 'px';
  const x = (e.clientX ?? rect.left + rect.width / 2) - rect.left - size / 2;
  const y = (e.clientY ?? rect.top + rect.height / 2) - rect.top - size / 2;
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 650);
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (btn) addRipple({ currentTarget: btn, clientX: e.clientX, clientY: e.clientY });
});

function fmtHora(hhmm) {
  return hhmm;
}

function gerarMensagemWhatsapp(loja, pedido) {
  const linhas = [];
  linhas.push(`🛍️ *Novo pedido — ${loja.nome}*`);
  linhas.push('');
  if (pedido.cliente?.nome) {
    linhas.push(`*Cliente:* ${pedido.cliente.nome}`);
    if (pedido.cliente.celular) linhas.push(`*Celular:* ${pedido.cliente.celular}`);
    linhas.push('');
  }
  pedido.itens.forEach(item => {
    linhas.push(`• ${item.qtd}x ${item.nome} — ${formatMoeda(item.preco * item.qtd)}`);
    if (item.obs) linhas.push(`   _obs: ${item.obs}_`);
  });
  linhas.push('');
  linhas.push(`*Subtotal:* ${formatMoeda(pedido.subtotal)}`);
  if (pedido.tipoEntrega === 'entrega') {
    linhas.push(`*Taxa de entrega:* ${formatMoeda(pedido.taxaEntrega)}`);
  }
  linhas.push(`*Total:* ${formatMoeda(pedido.total)}`);
  linhas.push('');
  linhas.push(`*Forma de pagamento:* ${pedido.formaPagamento}`);
  linhas.push(`*Tipo:* ${pedido.tipoEntrega === 'entrega' ? '🛵 Entrega' : '🏃 Retirada no local'}`);
  if (pedido.tipoEntrega === 'entrega' && pedido.endereco) {
    const e = pedido.endereco;
    linhas.push(`*Endereço:* ${e.rua}, ${e.numero} — ${e.bairro}, ${e.cidade}`);
    if (e.complemento) linhas.push(`*Complemento:* ${e.complemento}`);
  }
  linhas.push('');
  linhas.push(`*Pedido nº:* ${pedido.numero}`);
  return linhas.join('\n');
}

function abrirWhatsapp(telefone, mensagem) {
  const numero = (telefone || '').replace(/\D/g, '');
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function numeroPedido() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `#${n}`;
}
