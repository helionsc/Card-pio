# Migração para Supabase — passo a passo

Este pacote é o mesmo protótipo "Liquid Glass", mas agora **lojas e pedidos
ficam no Supabase** (um banco de dados na nuvem, compartilhado), em vez de
`localStorage`. Isso resolve o problema original: um cliente pode fazer um
pedido pelo celular dele, em qualquer lugar, e você vê esse pedido chegando
**em tempo real** no seu notebook.

O que continua só no navegador do cliente (não precisa ser compartilhado):
carrinho, endereços salvos e nome/celular pré-preenchido. Isso é intencional
— é só conveniência local, não faz sentido sincronizar entre dispositivos.

## 1. Criar o projeto no Supabase

1. Crie uma conta em https://supabase.com (tem plano gratuito) e clique em
   **New project**.
2. Escolha um nome, uma senha de banco (guarde-a, mas ela não é usada pelo
   app) e a região mais próxima de você.
3. Aguarde alguns minutos até o projeto ficar pronto.

## 2. Rodar o schema SQL

1. No painel do projeto, abra **SQL Editor → New query**.
2. Copie todo o conteúdo do arquivo `supabase-schema.sql` (incluído aqui) e
   cole no editor.
3. Clique em **Run**. Isso cria as tabelas `lojas` e `pedidos`, configura as
   permissões (RLS), liga o Realtime e já insere as duas lojas de
   demonstração (Burger House e Pizza Bella) com os mesmos produtos do
   protótipo original.

Se quiser conferir, vá em **Table Editor** e veja as tabelas `lojas` e
`pedidos` preenchidas.

## 3. Pegar a URL e a chave do projeto

1. Vá em **Project Settings → API**.
2. Copie o **Project URL**.
3. Copie a chave **anon public** (não a `service_role`, essa nunca deve ir
   para o navegador).

## 4. Preencher `js/config.js`

Abra `js/config.js` e substitua:

```js
const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA-CHAVE-ANON-PUBLICA-AQUI';
```

pelos valores reais do seu projeto.

## 5. Colocar o site no ar

Para o cliente pedir do celular dele, os arquivos HTML/CSS/JS precisam estar
acessíveis pela internet (não basta abrir `index.html` direto do seu
computador). O banco de dados (Supabase) já está na nuvem — falta só
hospedar esses arquivos estáticos. Algumas opções gratuitas e simples:

- **Netlify** (mais fácil): entre em https://app.netlify.com/drop e arraste
  a pasta inteira do projeto. Em segundos você recebe um link público.
- **Vercel** ou **GitHub Pages**: também funcionam bem para arquivos
  estáticos como esses.

Depois de publicado, os links ficam assim:
- Cardápio do cliente: `https://seu-site.netlify.app/loja.html?id=burger-house`
- Painel do vendedor: `https://seu-site.netlify.app/admin-login.html`

## 6. Testar o fluxo completo

1. Abra `admin-login.html` no seu notebook e entre com `burger` / `1234`
   (ou `pizza` / `1234`).
2. Deixe a aba do painel aberta na tela **Pedidos**.
3. No celular (ou em outra aba/navegador), abra
   `loja.html?id=burger-house` e finalize um pedido de teste.
4. O pedido deve aparecer quase instantaneamente no painel do notebook, com
   um som de alerta e uma notificação — isso é o Supabase Realtime
   funcionando, sem precisar recarregar a página.

## O que muda em relação ao protótipo original

- `js/db.js` foi reescrito: as funções de loja e pedidos agora conversam com
  o Supabase (são assíncronas). Carrinho, endereços, dados do cliente e
  sessão do admin continuam no `localStorage`, como antes.
- `index.html`, `admin-login.html`, `loja.html` e `admin.html` foram
  ajustados só no necessário para usar essas funções assíncronas e para
  assinar atualizações em tempo real (`DB.subscribePedidos`).
- O restante (visual, fluxo de compra, painel administrativo, mensagem do
  WhatsApp) é idêntico ao protótipo original.

## ⚠️ Aviso importante de segurança

Este continua sendo um protótipo, agora com um banco compartilhado na
internet. Para manter a migração simples, as permissões (RLS) do Supabase
estão **abertas**: qualquer pessoa que descobrir a `anon key` pública do seu
projeto (ela fica visível no código do site, isso é normal) consegue ler e
alterar as tabelas `lojas` e `pedidos` — incluindo o campo `senha`.

Para um uso pessoal/entre poucas lojas de confiança, isso costuma ser
aceitável. Mas:
- **Não reutilize** essas senhas de loja em nenhum outro lugar.
- Se no futuro isso crescer (mais lojistas, dados mais sensíveis), vale
  investir em autenticação de verdade (Supabase Auth) com políticas de RLS
  por usuário, e mover a checagem de senha para uma função no servidor
  (Postgres function/Edge Function) que nunca expõe a senha ao navegador.
  Posso te ajudar a implementar isso quando fizer sentido.

## Próximos passos sugeridos

1. Trocar as senhas de demonstração (`1234`) por senhas de verdade na tela
   **Loja → Acesso** do painel, depois de configurar o Supabase.
2. Testar bem em wifi ruim / 4G para garantir que os toasts de erro
   ("não foi possível enviar o pedido") aparecem quando cabível.
3. Trocar as fotos/URLs de produtos pelos produtos reais da loja.
4. Quando quiser, evoluir a autenticação (ver aviso de segurança acima).
