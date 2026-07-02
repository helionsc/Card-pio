/* =========================================================
   db.js — Camada de dados
   - Lojas e pedidos: Supabase (compartilhado entre dispositivos)
   - Carrinho, endereços, dados do cliente e sessão do admin:
     continuam no localStorage do navegador (são só locais mesmo,
     não precisam sincronizar entre dispositivos)
   ========================================================= */

const DB = (() => {

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const KEYS = {
    enderecos: () => `cliente_enderecos`,
    carrinho: (id) => `carrinho_${id}`,
    session: () => `admin_session`,
    clienteInfo: () => `cliente_info`,
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

  /* ---------- LOJAS (Supabase) ---------- */

  // Reconstrói o objeto "loja" no mesmo formato que o app espera
  // (usuario/senha na raiz + tudo que está em "dados" também na raiz).
  function rowParaLoja(row) {
    if (!row) return null;
    return { id: row.id, usuario: row.usuario, senha: row.senha, ...(row.dados || {}) };
  }

  function lojaParaRow(loja) {
    const { id, usuario, senha, ...dados } = loja;
    return { id, usuario, senha, dados, updated_at: new Date().toISOString() };
  }

  async function listLojaIds() {
    const { data, error } = await supabase.from('lojas').select('id');
    if (error) { console.error('listLojaIds', error); return []; }
    return (data || []).map(r => r.id);
  }

  async function getLoja(lojaId) {
    if (!lojaId) return null;
    const { data, error } = await supabase.from('lojas').select('*').eq('id', lojaId).maybeSingle();
    if (error) { console.error('getLoja', error); return null; }
    return rowParaLoja(data);
  }

  async function saveLoja(loja) {
    const row = lojaParaRow(loja);
    const { error } = await supabase.from('lojas').upsert(row);
    if (error) { console.error('saveLoja', error); throw error; }
    return loja;
  }

  async function autenticar(usuario, senha) {
    if (!usuario || !senha) return null;
    const { data, error } = await supabase
      .from('lojas')
      .select('*')
      .eq('usuario', usuario)
      .eq('senha', senha)
      .maybeSingle();
    if (error) { console.error('autenticar', error); return null; }
    return rowParaLoja(data);
  }

  /* ---------- STATUS DE FUNCIONAMENTO (puro, sem rede) ---------- */

  function isLojaAberta(loja) {
    if (!loja) return false;
    if (loja.forcarFechado) return false;

    const now = new Date();
    const diaSemana = now.getDay();
    const horario = loja.horarios?.[diaSemana];
    if (!horario || !horario.ativo) return false;

    const [hAberH, hAberM] = horario.abre.split(':').map(Number);
    const [hFechH, hFechM] = horario.fecha.split(':').map(Number);

    const minutosAgora = now.getHours() * 60 + now.getMinutes();
    const minutosAbre = hAberH * 60 + hAberM;
    let minutosFecha = hFechH * 60 + hFechM;

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

  /* ---------- PEDIDOS (Supabase) ---------- */

  function rowParaPedido(row) {
    if (!row) return null;
    return { ...(row.dados || {}), id: row.id, status: row.status };
  }

  function pedidoParaRow(lojaId, pedido) {
    return {
      id: pedido.id,
      loja_id: lojaId,
      numero: pedido.numero,
      status: pedido.status,
      criado_em: new Date(pedido.criadoEm || Date.now()).toISOString(),
      dados: pedido,
    };
  }

  async function getPedidos(lojaId) {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('loja_id', lojaId)
      .order('criado_em', { ascending: false });
    if (error) { console.error('getPedidos', error); return []; }
    return (data || []).map(rowParaPedido);
  }

  async function savePedido(lojaId, pedido) {
    const row = pedidoParaRow(lojaId, pedido);
    const { error } = await supabase.from('pedidos').insert(row);
    if (error) { console.error('savePedido', error); throw error; }
    return pedido;
  }

  async function updatePedidoStatus(lojaId, pedidoId, novoStatus) {
    const { data: existing, error: e1 } = await supabase
      .from('pedidos').select('dados').eq('id', pedidoId).maybeSingle();
    if (e1 || !existing) { console.error('updatePedidoStatus (leitura)', e1); return null; }

    const dados = existing.dados || {};
    dados.status = novoStatus;
    dados.statusHistorico = dados.statusHistorico || [];
    dados.statusHistorico.push({ status: novoStatus, em: Date.now() });

    const { error } = await supabase
      .from('pedidos')
      .update({ status: novoStatus, dados })
      .eq('id', pedidoId);
    if (error) { console.error('updatePedidoStatus', error); throw error; }
    return dados;
  }

  // Assina atualizações em tempo real dos pedidos de uma loja.
  // onChange recebe (payload) do Supabase Realtime a cada INSERT/UPDATE.
  function subscribePedidos(lojaId, onChange) {
    const channel = supabase
      .channel(`pedidos-${lojaId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'pedidos', filter: `loja_id=eq.${lojaId}`,
      }, (payload) => onChange(payload))
      .subscribe();
    return channel;
  }

  /* ---------- ENDEREÇOS DO CLIENTE (localStorage) ---------- */

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

  /* ---------- DADOS DO CLIENTE (localStorage) ---------- */

  function getClienteInfo() {
    return read(KEYS.clienteInfo(), { nome: '', celular: '' });
  }

  function saveClienteInfo(info) {
    write(KEYS.clienteInfo(), info);
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

  /* ---------- SESSÃO ADMIN (localStorage) ---------- */

  function getSession() {
    return read(KEYS.session(), null);
  }

  function setSession(lojaId) {
    write(KEYS.session(), { lojaId, em: Date.now() });
  }

  function clearSession() {
    localStorage.removeItem(KEYS.session());
  }

  return {
    uid,
    listLojaIds, getLoja, saveLoja, autenticar,
    isLojaAberta, proximoHorario, NOMES_DIAS,
    getPedidos, savePedido, updatePedidoStatus, subscribePedidos,
    getEnderecos, saveEndereco, deleteEndereco,
    getClienteInfo, saveClienteInfo,
    getCarrinho, saveCarrinho, clearCarrinho,
    getSession, setSession, clearSession,
  };
})();
