/* =========================================================
   icons.js — Biblioteca de ícones SVG estilo SF Symbols/iFood
   Traço fino, uniforme, sem emojis. Cada ícone é uma função
   que retorna uma string SVG, podendo customizar tamanho/classe.
   ========================================================= */

const Icon = (() => {
  const S = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  const SF = 'fill="currentColor" stroke="none"'; // variante preenchida (estado ativo)

  function wrap(inner, opts = {}) {
    const cls = opts.class ? ` class="${opts.class}"` : '';
    const size = opts.size || 22;
    return `<svg${cls} width="${size}" height="${size}" viewBox="0 0 24 24" ${opts.filled ? '' : ''}>${inner}</svg>`;
  }

  return {
    // ---------- Navegação ----------
    home: (o = {}) => o.filled
      ? wrap(`<path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" ${SF}/>`, o)
      : wrap(`<path d="M3 11.5 12 4l9 7.5" ${S}/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" ${S}/>`, o),
    search: (o = {}) => wrap(`<circle cx="11" cy="11" r="7" ${S}/><line x1="21" y1="21" x2="16.2" y2="16.2" ${S}/>`, o),
    tag: (o = {}) => wrap(`<path d="M3 11.5V5a1 1 0 0 1 1-1h6.5a1 1 0 0 1 .7.3l9 9a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-9-9a1 1 0 0 1-.3-.7Z" ${S}/><circle cx="8" cy="8" r="1.3" fill="currentColor" stroke="none"/>`, o),
    receipt: (o = {}) => wrap(`<path d="M6 3h12v17l-2.5-1.5L13 20l-1-1.5L11 20l-2.5-1.5L6 20Z" ${S}/><line x1="9" y1="8" x2="15" y2="8" ${S}/><line x1="9" y1="11.5" x2="15" y2="11.5" ${S}/>`, o),
    user: (o = {}) => wrap(`<circle cx="12" cy="8" r="3.5" ${S}/><path d="M4.5 20c1-3.5 4-5.5 7.5-5.5s6.5 2 7.5 5.5" ${S}/>`, o),
    store: (o = {}) => wrap(`<path d="M3 9.5 4.5 4h15L21 9.5" ${S}/><path d="M3 9.5c0 1.4 1.1 2.5 2.5 2.5S8 10.9 8 9.5c0 1.4 1.1 2.5 2.5 2.5S13 10.9 13 9.5c0 1.4 1.1 2.5 2.5 2.5S18 10.9 18 9.5c0 1.4 1.1 2.5 2.5 2.5.4 0 .7-.1 1-.2" ${S}/><path d="M5 12v8h14v-8" ${S}/><path d="M9.5 20v-5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5v5" ${S}/>`, o),
    eye: (o = {}) => wrap(`<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" ${S}/><circle cx="12" cy="12" r="3" ${S}/>`, o),
    grid: (o = {}) => wrap(`<rect x="3.5" y="3.5" width="7" height="7" rx="1.5" ${S}/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" ${S}/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" ${S}/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" ${S}/>`, o),
    clock: (o = {}) => wrap(`<circle cx="12" cy="12" r="8.5" ${S}/><path d="M12 7.5V12l3 2" ${S}/>`, o),
    settings: (o = {}) => wrap(`<circle cx="12" cy="12" r="3" ${S}/><path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.6V4a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.6 1H20a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.6 1Z" ${S}/>`, o),
    lock: (o = {}) => wrap(`<rect x="5" y="11" width="14" height="9" rx="2" ${S}/><path d="M8 11V7a4 4 0 0 1 8 0v4" ${S}/><circle cx="12" cy="15.3" r="1.1" fill="currentColor" stroke="none"/>`, o),

    // ---------- Ações / símbolos ----------
    close: (o = {}) => wrap(`<line x1="6" y1="6" x2="18" y2="18" ${S}/><line x1="18" y1="6" x2="6" y2="18" ${S}/>`, o),
    chevronLeft: (o = {}) => wrap(`<polyline points="15 6 9 12 15 18" ${S}/>`, o),
    chevronRight: (o = {}) => wrap(`<polyline points="9 6 15 12 9 18" ${S}/>`, o),
    chevronUp: (o = {}) => wrap(`<polyline points="6 15 12 9 18 15" ${S}/>`, o),
    chevronDown: (o = {}) => wrap(`<polyline points="6 9 12 15 18 9" ${S}/>`, o),
    check: (o = {}) => wrap(`<polyline points="5 13 9.5 17.5 19 7" ${S}/>`, o),
    checkCircle: (o = {}) => wrap(`<circle cx="12" cy="12" r="9" ${S}/><polyline points="8 12.5 11 15.5 16 9" ${S}/>`, o),
    plus: (o = {}) => wrap(`<line x1="12" y1="5" x2="12" y2="19" ${S}/><line x1="5" y1="12" x2="19" y2="12" ${S}/>`, o),
    edit: (o = {}) => wrap(`<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" ${S}/>`, o),
    trash: (o = {}) => wrap(`<polyline points="4 7 20 7" ${S}/><path d="M6 7V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2" ${S}/><path d="M7 7l1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" ${S}/><line x1="10" y1="11" x2="10" y2="17" ${S}/><line x1="14" y1="11" x2="14" y2="17" ${S}/>`, o),
    logout: (o = {}) => wrap(`<path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" ${S}/><polyline points="14 16 19 11 14 6" ${S}/><line x1="19" y1="11" x2="8" y2="11" ${S}/>`, o),
    warning: (o = {}) => wrap(`<path d="M12 4 21.5 20H2.5Z" ${S}/><line x1="12" y1="10" x2="12" y2="14.5" ${S}/><circle cx="12" cy="17.3" r="0.6" fill="currentColor" stroke="none"/>`, o),

    // ---------- Loja / pedido ----------
    pin: (o = {}) => wrap(`<path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z" ${S}/><circle cx="12" cy="9.5" r="2.3" ${S}/>`, o),
    bike: (o = {}) => wrap(`<circle cx="5.5" cy="17.5" r="3.2" ${S}/><circle cx="18.5" cy="17.5" r="3.2" ${S}/><path d="M5.5 17.5 9 9h5l3 4.5h2" ${S}/><path d="M9 9 7.5 6H5.5" ${S}/><path d="M11 13.2h3.8" ${S}/>`, o),
    walk: (o = {}) => wrap(`<circle cx="13" cy="4.5" r="1.7" ${S}/><path d="M10 22l1.3-6.2L9 13l1-5 3.3 1 2.2 3 3 1.3" ${S}/><path d="M11.3 15.8 8 19" ${S}/><path d="M14 16l1.5 6" ${S}/>`, o),
    bag: (o = {}) => wrap(`<path d="M6 8h12l-1 12.5a1 1 0 0 1-1 .9H8a1 1 0 0 1-1-.9Z" ${S}/><path d="M9 8V6a3 3 0 0 1 6 0v2" ${S}/>`, o),
    cart: (o = {}) => wrap(`<circle cx="9.5" cy="20" r="1.3" fill="currentColor" stroke="none"/><circle cx="17.5" cy="20" r="1.3" fill="currentColor" stroke="none"/><path d="M3 4h2l2.2 11.4a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.2L20.5 8H6" ${S}/>`, o),
    bowl: (o = {}) => wrap(`<path d="M3.5 12h17a8.5 7.5 0 0 1-17 0Z" ${S}/><path d="M4 16.5 5 19.5h14l1-3" ${S}/>`, o),

    // ---------- Pagamento ----------
    pix: (o = {}) => wrap(`<rect x="4" y="4" width="16" height="16" rx="4" transform="rotate(45 12 12)" ${S}/><path d="M9.5 9.5h2a1.5 1.5 0 0 1 0 3h-3M14.5 14.5h-2a1.5 1.5 0 0 1 0-3h3" ${S}/>`, o),
    card: (o = {}) => wrap(`<rect x="3" y="5.5" width="18" height="13" rx="2" ${S}/><line x1="3" y1="10" x2="21" y2="10" ${S}/><line x1="6" y1="14.5" x2="10" y2="14.5" ${S}/>`, o),
    cash: (o = {}) => wrap(`<rect x="2.5" y="6.5" width="19" height="11" rx="1.5" ${S}/><circle cx="12" cy="12" r="3" ${S}/><line x1="5.5" y1="9" x2="5.5" y2="9" ${S}/><line x1="18.5" y1="15" x2="18.5" y2="15" ${S}/>`, o),

    // ---------- Outros ----------
    party: (o = {}) => wrap(`<path d="M4 20 7 8l11.5 5.5L8 17Z" ${S}/><line x1="13.5" y1="4" x2="14.3" y2="6.2" ${S}/><line x1="18" y1="6" x2="16.4" y2="7.6" ${S}/><line x1="20" y1="10" x2="17.7" y2="10.4" ${S}/>`, o),
    flame: (o = {}) => wrap(`<path d="M12 21c-4 0-6.5-2.7-6.5-6 0-3 2-4.8 2.6-7.3.3 1.4 1.2 2.3 2 2.3-.4-2.7.6-5.3 3-7 .2 2.2 1 3.6 2.4 5 1.7 1.7 2.5 3.6 2.5 6 0 4-3 7-6 7Z" ${S}/>`, o),
    percent: (o = {}) => wrap(`<line x1="19" y1="5" x2="5" y2="19" ${S}/><circle cx="7" cy="7" r="2.3" ${S}/><circle cx="17" cy="17" r="2.3" ${S}/>`, o),
    search404: (o = {}) => wrap(`<circle cx="10" cy="10" r="7" ${S}/><line x1="20" y1="20" x2="15" y2="15" ${S}/><line x1="7.5" y1="10" x2="12.5" y2="10" ${S}/>`, o),
  };
})();

// Auto-injeta ícones em qualquer elemento estático com data-icon="nome" (e
// opcionalmente data-icon-size="18"). Permite usar ícones direto no HTML
// sem precisar montar o elemento via template string em JS.
function injetarIcones(root = document) {
  root.querySelectorAll('[data-icon]').forEach(el => {
    const nome = el.getAttribute('data-icon');
    const size = parseInt(el.getAttribute('data-icon-size') || '20', 10);
    const filled = el.hasAttribute('data-icon-filled');
    if (Icon[nome]) el.innerHTML = Icon[nome]({ size, filled });
  });
}
document.addEventListener('DOMContentLoaded', () => injetarIcones());
