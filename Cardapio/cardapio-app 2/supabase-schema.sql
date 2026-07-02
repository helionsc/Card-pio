-- =========================================================
-- Cardápio Digital — Schema Supabase
-- Rode este script inteiro em: Supabase → SQL Editor → New query
-- =========================================================

create table if not exists lojas (
  id text primary key,
  usuario text unique not null,
  senha text not null,
  dados jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists pedidos (
  id text primary key,
  loja_id text not null references lojas(id) on delete cascade,
  numero text,
  status text not null default 'recebido',
  dados jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now()
);

create index if not exists idx_pedidos_loja on pedidos(loja_id);
create index if not exists idx_pedidos_status on pedidos(status);

alter table lojas enable row level security;
alter table pedidos enable row level security;

-- ---------------------------------------------------------
-- ATENÇÃO — segurança de protótipo:
-- Estas políticas são propositalmente abertas (qualquer pessoa com a
-- "anon key" pública do seu projeto consegue ler e gravar nessas tabelas,
-- incluindo o campo "senha"). Isso é aceitável para um protótipo pessoal,
-- mas NÃO reutilize essas senhas em outro lugar, e não trate isso como
-- seguro para dados sensíveis de verdade. Ver README-SUPABASE.md.
-- ---------------------------------------------------------
drop policy if exists "lojas select" on lojas;
create policy "lojas select" on lojas for select using (true);
drop policy if exists "lojas insert" on lojas;
create policy "lojas insert" on lojas for insert with check (true);
drop policy if exists "lojas update" on lojas;
create policy "lojas update" on lojas for update using (true);

drop policy if exists "pedidos select" on pedidos;
create policy "pedidos select" on pedidos for select using (true);
drop policy if exists "pedidos insert" on pedidos;
create policy "pedidos insert" on pedidos for insert with check (true);
drop policy if exists "pedidos update" on pedidos;
create policy "pedidos update" on pedidos for update using (true);

-- Habilita o Realtime (para o painel do vendedor receber pedidos na hora)
alter publication supabase_realtime add table pedidos;

-- =========================================================
-- Seed: lojas de demonstração (mesmos dados do protótipo original)
-- =========================================================
insert into lojas (id, usuario, senha, dados) values
('burger-house', 'burger', '1234', '{"nome":"Burger House","slogan":"Smash burgers artesanais","logoUrl":"","corPrimaria":"#FF6B35","corSecundaria":"#1A1A1A","tempoMedioMin":35,"tempoMedioMax":50,"taxaEntrega":6,"pedidoMinimo":20,"horarios":{"0":{"ativo":true,"abre":"18:00","fecha":"23:30"},"1":{"ativo":false,"abre":"18:00","fecha":"23:30"},"2":{"ativo":true,"abre":"18:00","fecha":"23:30"},"3":{"ativo":true,"abre":"18:00","fecha":"23:30"},"4":{"ativo":true,"abre":"18:00","fecha":"23:30"},"5":{"ativo":true,"abre":"18:00","fecha":"23:59"},"6":{"ativo":true,"abre":"18:00","fecha":"23:59"}},"forcarFechado":false,"categorias":[{"id":"cat_destaques","nome":"Destaques","ordem":0},{"id":"cat_burgers","nome":"Hambúrgueres","ordem":1},{"id":"cat_acompanhamentos","nome":"Acompanhamentos","ordem":2},{"id":"cat_bebidas","nome":"Bebidas","ordem":3},{"id":"cat_sobremesas","nome":"Sobremesas","ordem":4}],"produtos":[{"id":"p_1782951183276_pvje44","nome":"Smash Clássico","descricao":"Pão brioche, blend 150g smashed, queijo cheddar, picles e maionese da casa.","preco":28.9,"foto":"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80","categoriaId":"cat_destaques","disponivel":true,"destaque":true},{"id":"p_1782951183277_85x33k","nome":"Bacon Cheddar Duplo","descricao":"Dois blends de 100g, queijo cheddar duplo, bacon crocante e cebola caramelizada.","preco":34.9,"foto":"https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&q=80","categoriaId":"cat_burgers","disponivel":true,"destaque":true},{"id":"p_1782951183277_r7yihi","nome":"Smash Clássico","descricao":"Pão brioche, blend 150g smashed, queijo cheddar, picles e maionese da casa.","preco":28.9,"foto":"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80","categoriaId":"cat_burgers","disponivel":true},{"id":"p_1782951183277_t5oc6k","nome":"Veggie Grelhado","descricao":"Hambúrguer de grão-de-bico e quinoa, rúcula, tomate seco e maionese de alho.","preco":30.9,"foto":"https://images.unsplash.com/photo-1525059696034-4967a729002e?w=600&q=80","categoriaId":"cat_burgers","disponivel":true},{"id":"p_1782951183277_inqest","nome":"BBQ Onion","descricao":"Blend 150g, queijo prato, onion rings crocantes e barbecue da casa.","preco":32.9,"foto":"https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80","categoriaId":"cat_burgers","disponivel":true},{"id":"p_1782951183277_zhfj01","nome":"Batata Frita Rústica","descricao":"Porção generosa com casca, alecrim e flor de sal.","preco":16.9,"foto":"https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80","categoriaId":"cat_acompanhamentos","disponivel":true},{"id":"p_1782951183277_9dhh5o","nome":"Onion Rings","descricao":"Anéis de cebola empanados e fritos até dourar.","preco":18.9,"foto":"https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&q=80","categoriaId":"cat_acompanhamentos","disponivel":true},{"id":"p_1782951183277_0i8rm5","nome":"Coca-Cola Lata 350ml","descricao":"Gelada.","preco":7,"foto":"https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&q=80","categoriaId":"cat_bebidas","disponivel":true},{"id":"p_1782951183277_cm0yvs","nome":"Suco Natural de Laranja 500ml","descricao":"Feito na hora.","preco":11,"foto":"https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&q=80","categoriaId":"cat_bebidas","disponivel":true},{"id":"p_1782951183277_roipkc","nome":"Brownie com Sorvete","descricao":"Brownie quente, bola de sorvete de creme e calda de chocolate.","preco":19.9,"foto":"https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80","categoriaId":"cat_sobremesas","disponivel":true}]}'::jsonb)
on conflict (id) do nothing;

insert into lojas (id, usuario, senha, dados) values
('pizza-bella', 'pizza', '1234', '{"nome":"Pizza Bella","slogan":"Pizzas napolitanas no forno a lenha","logoUrl":"","corPrimaria":"#C8102E","corSecundaria":"#1B1B1B","tempoMedioMin":40,"tempoMedioMax":60,"taxaEntrega":8,"pedidoMinimo":35,"horarios":{"0":{"ativo":true,"abre":"18:00","fecha":"23:30"},"1":{"ativo":false,"abre":"18:00","fecha":"23:30"},"2":{"ativo":true,"abre":"18:00","fecha":"23:30"},"3":{"ativo":true,"abre":"18:00","fecha":"23:30"},"4":{"ativo":true,"abre":"18:00","fecha":"23:30"},"5":{"ativo":true,"abre":"18:00","fecha":"23:59"},"6":{"ativo":true,"abre":"18:00","fecha":"23:59"}},"forcarFechado":false,"categorias":[{"id":"cat_destaques","nome":"Destaques","ordem":0},{"id":"cat_salgadas","nome":"Pizzas Salgadas","ordem":1},{"id":"cat_doces","nome":"Pizzas Doces","ordem":2},{"id":"cat_bebidas","nome":"Bebidas","ordem":3}],"produtos":[{"id":"p_1782951183277_kbgt7s","nome":"Margherita","descricao":"Molho de tomate, mussarela de búfala, manjericão fresco e azeite extra virgem.","preco":49.9,"foto":"https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&q=80","categoriaId":"cat_destaques","disponivel":true,"destaque":true},{"id":"p_1782951183277_9p4l54","nome":"Pepperoni","descricao":"Molho de tomate, mussarela e generosas fatias de pepperoni.","preco":54.9,"foto":"https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80","categoriaId":"cat_destaques","disponivel":true,"destaque":true},{"id":"p_1782951183277_0w6llv","nome":"Margherita","descricao":"Molho de tomate, mussarela de búfala, manjericão fresco e azeite extra virgem.","preco":49.9,"foto":"https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&q=80","categoriaId":"cat_salgadas","disponivel":true},{"id":"p_1782951183277_4pulr2","nome":"Quattro Formaggi","descricao":"Mussarela, gorgonzola, parmesão e provolone.","preco":57.9,"foto":"https://images.unsplash.com/photo-1593560708920-61b98ae7f8ab?w=600&q=80","categoriaId":"cat_salgadas","disponivel":true},{"id":"p_1782951183277_xcn1d9","nome":"Calabresa Acebolada","descricao":"Calabresa artesanal, cebola roxa e azeitonas.","preco":52.9,"foto":"https://images.unsplash.com/photo-1593246049226-decd4540f15e?w=600&q=80","categoriaId":"cat_salgadas","disponivel":true},{"id":"p_1782951183277_vx4xk8","nome":"Chocolate com Morango","descricao":"Chocolate ao leite derretido com morangos frescos.","preco":46.9,"foto":"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80","categoriaId":"cat_doces","disponivel":true},{"id":"p_1782951183277_exl0oi","nome":"Água Mineral 500ml","descricao":"Com ou sem gás.","preco":5,"foto":"https://images.unsplash.com/photo-1560023907-5f339617ea30?w=600&q=80","categoriaId":"cat_bebidas","disponivel":true},{"id":"p_1782951183277_i2ovjf","nome":"Refrigerante 2L","descricao":"Coca-Cola, Guaraná ou Fanta.","preco":14,"foto":"https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80","categoriaId":"cat_bebidas","disponivel":true}]}'::jsonb)
on conflict (id) do nothing;
