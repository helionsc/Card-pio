# Cardápio Digital — Protótipo "Liquid Glass"

Protótipo navegável (HTML/CSS/JS puro, sem dependências) de um cardápio digital
multi-loja com painel de gestão para o vendedor, no estilo visual "liquid glass"
da Apple.

## Como abrir

Basta abrir `index.html` em qualquer navegador moderno (Chrome, Safari, Edge).
Não precisa de servidor — mas se preferir rodar localmente:

```bash
cd cardapio-app
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

> **Importante:** os dados ficam salvos no `localStorage` do navegador.
> Isso significa que cada navegador/dispositivo tem sua própria "base de dados"
> de demonstração. Para ver o fluxo completo (cliente pede → vendedor gerencia),
> use o **mesmo navegador** para as duas pontas.

## Lojas de demonstração

| Loja | Link do cardápio | Login do painel |
|---|---|---|
| 🍔 Burger House | `loja.html?id=burger-house` | usuário `burger` / senha `1234` |
| 🍕 Pizza Bella | `loja.html?id=pizza-bella` | usuário `pizza` / senha `1234` |

A tela inicial (`index.html`) lista as duas para facilitar a navegação —
em produção, cada loja teria apenas seu link direto, sem essa tela seletora.

## Estrutura de arquivos

```
cardapio-app/
├── index.html          → Seletor de lojas (só existe no protótipo)
├── loja.html            → Cardápio do cliente (uma página, qualquer loja via ?id=)
├── admin-login.html     → Login do vendedor (usuário/senha identifica a loja automaticamente)
├── admin.html           → Painel completo do vendedor
├── css/
│   └── glass.css        → Design system "liquid glass" (tokens, componentes)
├── js/
│   ├── icons.js           → Biblioteca de ícones SVG estilo SF Symbols/iFood (zero emoji na UI)
│   ├── db.js              → Camada de dados (localStorage) + regras de negócio
│   └── utils.js           → Helpers (moeda, toast, mensagem de WhatsApp, etc.)
└── data/                 → (reservado para uso futuro)
```

## O que já funciona neste protótipo

**Cardápio do cliente (`loja.html`)**
- Identidade visual por loja (cor + logo)
- Abas de categoria com scroll automático (scroll-spy)
- Bloqueio de pedidos quando a loja está fechada (baseado no horário configurado)
- Carrinho com somatório automático, observações por item
- Checkout: entrega ou retirada, múltiplos endereços salvos, forma de pagamento
  (sem processar pagamento — é só informativo, vai na mensagem do pedido)
- Envio do pedido formatado para o WhatsApp da loja (via `wa.me`)
- Acompanhamento do status do pedido (recebido → em preparo → a caminho/pronto → concluído),
  com um indicador flutuante que persiste mesmo se a página for recarregada

**Painel do vendedor (`admin.html`)**
- Dashboard com estatísticas do dia e atalhos
- Toggle para forçar a loja fechada manualmente (além do horário programado)
- CRUD completo de produtos (nome, descrição, preço, foto, categoria, disponibilidade)
- CRUD de categorias, com reordenação (a ordem aqui é a ordem que o cliente vê)
- Configuração de horário de funcionamento por dia da semana
- Configuração de tempo médio de preparo/entrega
- Lista de pedidos recebidos com atualização de status
- Configurações da loja: nome, slogan, logo, cor da marca, WhatsApp, taxa de entrega,
  pedido mínimo, senha de acesso

## O que é simulado (e vai mudar na fase 2, com backend)

- **Notificações automáticas via WhatsApp:** hoje, o pedido é enviado para o
  WhatsApp da loja com uma mensagem pronta (`wa.me`), e o cliente acompanha o
  status *dentro do próprio app*. Na versão com backend, isso vira notificações
  reais enviadas automaticamente ao WhatsApp do cliente via API oficial do
  WhatsApp Business (Meta Cloud API), exigindo servidor próprio e número
  verificado.
- **Multi-loja com banco de dados real:** hoje cada loja vive isolada no
  `localStorage` do navegador. Em produção, isso vira um banco de dados central
  (Postgres, Firebase, etc.), permitindo acessar a mesma loja de qualquer
  dispositivo.
- **Pagamento:** propositalmente fora do escopo desta fase — o cliente só
  escolhe a forma de pagamento, e o acerto acontece direto com o estabelecimento.

## Próximos passos sugeridos

1. Validar o protótipo com lojistas reais (use o painel admin para simular a
   operação do dia a dia)
2. Decidir o backend (Node.js + Postgres é uma escolha sólida e comum)
3. Migrar a camada `db.js` para chamadas de API reais (a estrutura de dados já
   foi pensada para isso — os nomes de função não precisam mudar)
4. Integrar a WhatsApp Business Cloud API para notificações automáticas
5. Adicionar painel de "super-admin" para você gerenciar todas as lojas clientes
