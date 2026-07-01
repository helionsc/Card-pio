/* =========================================================
   db.js — Camada de dados (localStorage)
   Estrutura pensada para migrar facilmente para um backend real:
   cada função aqui pode futuramente virar uma chamada fetch().
   ========================================================= */

const DB = (() => {

  const KEYS = {
    loja: (id) => `loja_${id}`,
    pedidos: (id) => `pedidos_${id}`,
    enderecos: () => `cliente_enderecos`,
    carrinho: (id) => `carrinho_${id}`,
    session: () => `admin_session`,
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error('DB read error', key, e);
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uid(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /* ---------- LOJAS ---------- */

  function getLoja(lojaId) {
    return read(KEYS.loja(lojaId), null);
  }

  function saveLoja(loja) {
    write(KEYS.loja(loja.id), loja);
    return loja;
  }

  function listLojaIds() {
    const ids = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith('loja_')) ids.push(k.replace('loja_', ''));
    }
    return ids;
  }

  // Busca em todas as lojas qual tem esse usuário/senha — assim o login não
  // precisa pedir "qual loja", o usuário já identifica isso.
  // NOTA para migração a backend: nesse protótipo o nome de usuário é definido
  // na criação da loja e não pode ser duplicado entre lojas; ao migrar para um
  // banco real, validar unicidade de "usuario" na tabela de lojas/contas.
  function autenticar(usuario, senha) {
    const ids = listLojaIds();
    for (const id of ids) {
      const loja = getLoja(id);
      if (loja && loja.usuario === usuario && loja.senha === senha) {
        return loja;
      }
    }
    return null;
  }

  /* ---------- STATUS DE FUNCIONAMENTO ---------- */

  function isLojaAberta(loja) {
    if (!loja) return false;
    if (loja.forcarFechado) return false;

    const now = new Date();
    const diaSemana = now.getDay(); // 0=dom..6=sab
    const horario = loja.horarios?.[diaSemana];
    if (!horario || !horario.ativo) return false;

    const [hAberH, hAberM] = horario.abre.split(':').map(Number);
    const [hFechH, hFechM] = horario.fecha.split(':').map(Number);

    const minutosAgora = now.getHours() * 60 + now.getMinutes();
    const minutosAbre = hAberH * 60 + hAberM;
    let minutosFecha = hFechH * 60 + hFechM;

    // suporta fechamento depois da meia-noite (ex: abre 18:00 fecha 02:00)
    if (minutosFecha <= minutosAbre) {
      minutosFecha += 24 * 60;
      if (minutosAgora < minutosAbre) {
        return minutosAgora + 24 * 60 < minutosFecha;
      }
      return minutosAgora >= minutosAbre && minutosAgora < minutosFecha;
    }

    return minutosAgora >= minutosAbre && minutosAgora < minutosFecha;
  }

  function proximoHorario(loja) {
    if (!loja) return null;
    const now = new Date();
    for (let add = 0; add < 8; add++) {
      const d = new Date(now);
      d.setDate(now.getDate() + add);
      const dia = d.getDay();
      const horario = loja.horarios?.[dia];
      if (horario && horario.ativo) {
        if (add === 0) {
          const [hh, hm] = horario.abre.split(':').map(Number);
          const minutosAgora = now.getHours() * 60 + now.getMinutes();
          if (minutosAgora < hh * 60 + hm) {
            return { dia: 'hoje', hora: horario.abre };
          }
          continue;
        }
        return { dia: add === 1 ? 'amanhã' : NOMES_DIAS[dia], hora: horario.abre };
      }
    }
    return null;
  }

  const NOMES_DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

  /* ---------- PEDIDOS ---------- */

  function getPedidos(lojaId) {
    return read(KEYS.pedidos(lojaId), []);
  }

  function savePedido(lojaId, pedido) {
    const pedidos = getPedidos(lojaId);
    pedidos.unshift(pedido);
    write(KEYS.pedidos(lojaId), pedidos);
    return pedido;
  }

  function updatePedidoStatus(lojaId, pedidoId, novoStatus) {
    const pedidos = getPedidos(lojaId);
    const p = pedidos.find(p => p.id === pedidoId);
    if (p) {
      p.status = novoStatus;
      p.statusHistorico = p.statusHistorico || [];
      p.statusHistorico.push({ status: novoStatus, em: Date.now() });
      write(KEYS.pedidos(lojaId), pedidos);
    }
    return p;
  }

  /* ---------- ENDEREÇOS DO CLIENTE ---------- */

  function getEnderecos() {
    return read(KEYS.enderecos(), []);
  }

  function saveEndereco(endereco) {
    const lista = getEnderecos();
    if (endereco.id) {
      const idx = lista.findIndex(e => e.id === endereco.id);
      if (idx >= 0) lista[idx] = endereco;
      else lista.push(endereco);
    } else {
      endereco.id = uid('end');
      lista.push(endereco);
    }
    write(KEYS.enderecos(), lista);
    return endereco;
  }

  function deleteEndereco(id) {
    const lista = getEnderecos().filter(e => e.id !== id);
    write(KEYS.enderecos(), lista);
  }

  /* ---------- DADOS DO CLIENTE ---------- */

  function getClienteInfo() {
    return read('cliente_info', { nome: '', celular: '' });
  }

  function saveClienteInfo(info) {
    write('cliente_info', info);
    return info;
  }

  function getCarrinho(lojaId) {
    return read(KEYS.carrinho(lojaId), []);
  }

  function saveCarrinho(lojaId, itens) {
    write(KEYS.carrinho(lojaId), itens);
  }

  function clearCarrinho(lojaId) {
    write(KEYS.carrinho(lojaId), []);
  }

  /* ---------- SESSÃO ADMIN ---------- */

  function getSession() {
    return read(KEYS.session(), null);
  }

  function setSession(lojaId) {
    write(KEYS.session(), { lojaId, em: Date.now() });
  }

  function clearSession() {
    localStorage.removeItem(KEYS.session());
  }

  /* ---------- SEED: dados de demonstração ---------- */

  function horarioPadrao() {
    return {
      0: { ativo: true, abre: '18:00', fecha: '23:30' }, // dom
      1: { ativo: false, abre: '18:00', fecha: '23:30' }, // seg (fechado)
      2: { ativo: true, abre: '18:00', fecha: '23:30' },
      3: { ativo: true, abre: '18:00', fecha: '23:30' },
      4: { ativo: true, abre: '18:00', fecha: '23:30' },
      5: { ativo: true, abre: '18:00', fecha: '23:59' },
      6: { ativo: true, abre: '18:00', fecha: '23:59' },
    };
  }

  function seedIfEmpty() {
    if (!getLoja('burger-house')) {
      saveLoja({
        id: 'burger-house',
        nome: 'Burger House',
        slogan: 'Smash burgers artesanais',
        logoUrl: '',
        corPrimaria: '#FF6B35',
        corSecundaria: '#1A1A1A',
        usuario: 'burger',
        senha: '1234',
        tempoMedioMin: 35,
        tempoMedioMax: 50,
        taxaEntrega: 6.0,
        pedidoMinimo: 20,
        horarios: horarioPadrao(),
        forcarFechado: false,
        categorias: [
          { id: 'cat_destaques', nome: 'Destaques', ordem: 0 },
          { id: 'cat_burgers', nome: 'Hambúrgueres', ordem: 1 },
          { id: 'cat_acompanhamentos', nome: 'Acompanhamentos', ordem: 2 },
          { id: 'cat_bebidas', nome: 'Bebidas', ordem: 3 },
          { id: 'cat_sobremesas', nome: 'Sobremesas', ordem: 4 },
        ],
        produtos: [
          { id: uid('p'), nome: 'Smash Clássico', descricao: 'Pão brioche, blend 150g smashed, queijo cheddar, picles e maionese da casa.', preco: 28.9, foto: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80', categoriaId: 'cat_destaques', disponivel: true, destaque: true },
          { id: uid('p'), nome: 'Bacon Cheddar Duplo', descricao: 'Dois blends de 100g, queijo cheddar duplo, bacon crocante e cebola caramelizada.', preco: 34.9, foto: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&q=80', categoriaId: 'cat_burgers', disponivel: true, destaque: true },
          { id: uid('p'), nome: 'Smash Clássico', descricao: 'Pão brioche, blend 150g smashed, queijo cheddar, picles e maionese da casa.', preco: 28.9, foto: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80', categoriaId: 'cat_burgers', disponivel: true },
          { id: uid('p'), nome: 'Veggie Grelhado', descricao: 'Hambúrguer de grão-de-bico e quinoa, rúcula, tomate seco e maionese de alho.', preco: 30.9, foto: 'https://images.unsplash.com/photo-1525059696034-4967a729002e?w=600&q=80', categoriaId: 'cat_burgers', disponivel: true },
          { id: uid('p'), nome: 'BBQ Onion', descricao: 'Blend 150g, queijo prato, onion rings crocantes e barbecue da casa.', preco: 32.9, foto: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80', categoriaId: 'cat_burgers', disponivel: true },
          { id: uid('p'), nome: 'Batata Frita Rústica', descricao: 'Porção generosa com casca, alecrim e flor de sal.', preco: 16.9, foto: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80', categoriaId: 'cat_acompanhamentos', disponivel: true },
          { id: uid('p'), nome: 'Onion Rings', descricao: 'Anéis de cebola empanados e fritos até dourar.', preco: 18.9, foto: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&q=80', categoriaId: 'cat_acompanhamentos', disponivel: true },
          { id: uid('p'), nome: 'Coca-Cola Lata 350ml', descricao: 'Gelada.', preco: 7.0, foto: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&q=80', categoriaId: 'cat_bebidas', disponivel: true },
          { id: uid('p'), nome: 'Suco Natural de Laranja 500ml', descricao: 'Feito na hora.', preco: 11.0, foto: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&q=80', categoriaId: 'cat_bebidas', disponivel: true },
          { id: uid('p'), nome: 'Brownie com Sorvete', descricao: 'Brownie quente, bola de sorvete de creme e calda de chocolate.', preco: 19.9, foto: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80', categoriaId: 'cat_sobremesas', disponivel: true },
        ],
      });
    }

    if (!getLoja('pizza-bella')) {
      saveLoja({
        id: 'pizza-bella',
        nome: 'Pizza Bella',
        slogan: 'Pizzas napolitanas no forno a lenha',
        logoUrl: '',
        corPrimaria: '#C8102E',
        corSecundaria: '#1B1B1B',
        usuario: 'pizza',
        senha: '1234',
        tempoMedioMin: 40,
        tempoMedioMax: 60,
        taxaEntrega: 8.0,
        pedidoMinimo: 35,
        horarios: horarioPadrao(),
        forcarFechado: false,
        categorias: [
          { id: 'cat_destaques', nome: 'Destaques', ordem: 0 },
          { id: 'cat_salgadas', nome: 'Pizzas Salgadas', ordem: 1 },
          { id: 'cat_doces', nome: 'Pizzas Doces', ordem: 2 },
          { id: 'cat_bebidas', nome: 'Bebidas', ordem: 3 },
        ],
        produtos: [
          { id: uid('p'), nome: 'Margherita', descricao: 'Molho de tomate, mussarela de búfala, manjericão fresco e azeite extra virgem.', preco: 49.9, foto: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&q=80', categoriaId: 'cat_destaques', disponivel: true, destaque: true },
          { id: uid('p'), nome: 'Pepperoni', descricao: 'Molho de tomate, mussarela e generosas fatias de pepperoni.', preco: 54.9, foto: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80', categoriaId: 'cat_destaques', disponivel: true, destaque: true },
          { id: uid('p'), nome: 'Margherita', descricao: 'Molho de tomate, mussarela de búfala, manjericão fresco e azeite extra virgem.', preco: 49.9, foto: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&q=80', categoriaId: 'cat_salgadas', disponivel: true },
          { id: uid('p'), nome: 'Quattro Formaggi', descricao: 'Mussarela, gorgonzola, parmesão e provolone.', preco: 57.9, foto: 'https://images.unsplash.com/photo-1593560708920-61b98ae7f8ab?w=600&q=80', categoriaId: 'cat_salgadas', disponivel: true },
          { id: uid('p'), nome: 'Calabresa Acebolada', descricao: 'Calabresa artesanal, cebola roxa e azeitonas.', preco: 52.9, foto: 'https://images.unsplash.com/photo-1593246049226-decd4540f15e?w=600&q=80', categoriaId: 'cat_salgadas', disponivel: true },
          { id: uid('p'), nome: 'Chocolate com Morango', descricao: 'Chocolate ao leite derretido com morangos frescos.', preco: 46.9, foto: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80', categoriaId: 'cat_doces', disponivel: true },
          { id: uid('p'), nome: 'Água Mineral 500ml', descricao: 'Com ou sem gás.', preco: 5.0, foto: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=600&q=80', categoriaId: 'cat_bebidas', disponivel: true },
          { id: uid('p'), nome: 'Refrigerante 2L', descricao: 'Coca-Cola, Guaraná ou Fanta.', preco: 14.0, foto: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80', categoriaId: 'cat_bebidas', disponivel: true },
        ],
      });
    }
  }

  return {
    uid,
    getLoja, saveLoja, listLojaIds,
    autenticar,
    isLojaAberta, proximoHorario, NOMES_DIAS,
    getPedidos, savePedido, updatePedidoStatus,
    getClienteInfo, saveClienteInfo,
    getEnderecos, saveEndereco, deleteEndereco,
    getCarrinho, saveCarrinho, clearCarrinho,
    getSession, setSession, clearSession,
    seedIfEmpty,
  };
})();
