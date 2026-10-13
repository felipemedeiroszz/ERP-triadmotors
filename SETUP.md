# TRIAD MOTO PARTS - Guia de Configuração

Este guia irá ajudá-lo a configurar o sistema ERP/PDV da TRIAD MOTO PARTS do zero.

## Pré-requisitos

- Node.js 18+ instalado
- pnpm instalado (ou use npm/yarn)
- Conta no Supabase (gratuita)

## Passo 1: Configurar Supabase

### 1.1 Criar Projeto

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Preencha:
   - Name: `triad-moto-erp`
   - Database Password: (crie uma senha forte e salve)
   - Region: escolha a mais próxima
4. Aguarde a criação do projeto (pode levar alguns minutos)

### 1.2 Obter Credenciais

1. No painel do Supabase, vá em **Settings > API**
2. Copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (cuidado: nunca compartilhe esta chave)

### 1.3 Executar Schema do Banco de Dados

1. No painel do Supabase, vá em **SQL Editor**
2. Crie uma nova query
3. Copie todo o conteúdo do arquivo `supabase/schema.sql`
4. Cole e execute (clique em "Run")
5. Verifique se não houve erros

### 1.4 Configurar Storage

1. No painel do Supabase, vá em **Storage**
2. Clique em "New bucket"
3. Configure:
   - Name: `product-images`
   - Public bucket: **NÃO** (marque como não público)
   - File size limit: `5MB` (ou conforme preferir)
4. Clique em "Create bucket"
5. Vá em **SQL Editor** novamente
6. Copie o conteúdo de `supabase/storage-setup.sql`
7. Cole e execute

### 1.5 Criar Usuário Admin Inicial

No SQL Editor, execute:

```sql
-- Opção 1: Via SQL (recomendado para primeiro setup)
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  'admin@triadmoto.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  '{"full_name": "Administrador", "role": "admin"}'::jsonb
);

-- O trigger criará automaticamente o profile
```

Ou use a interface do Supabase Authentication para criar o primeiro usuário e depois atualize o role manualmente.

## Passo 2: Configurar Variáveis de Ambiente

1. Na raiz do projeto, crie o arquivo `.env.local`:

```bash
cp .env.example .env.local
```

2. Edite `.env.local` com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu-anon-key
SUPABASE_SERVICE_ROLE_KEY=seu-service-role-key
```

**IMPORTANTE:** Nunca commit o arquivo `.env.local` (já está no .gitignore)

## Passo 3: Instalar Dependências

```bash
pnpm install
```

## Passo 4: Executar o Projeto

```bash
pnpm dev
```

Acesse: http://localhost:3000

## Passo 5: Primeiro Login

1. Acesse http://localhost:3000
2. Você será redirecionado para a tela de login
3. Use as credenciais criadas:
   - Email: `admin@triadmoto.com`
   - Senha: `admin123`
4. Altere a senha imediatamente após o primeiro login

## Passo 6: Configurar Empresa

1. Após o login, vá em **Configurações**
2. Preencha as informações da empresa:
   - Nome
   - CNPJ
   - Telefone
   - WhatsApp
   - Endereço
   - etc.
3. Configure as preferências do sistema:
   - Formato de comprovante
   - Estoque mínimo padrão
   - Desconto máximo para funcionários
   - etc.

## Passo 7: Cadastrar Dados Iniciais

### Categorias

1. Vá em **Produtos** (ou crie tela de categorias se necessário)
2. Já existem categorias padrão criadas pelo schema:
   - Peças de Motor
   - Freios
   - Suspensão
   - Elétrica
   - Transmissão
   - Pneus
   - Acessórios
   - Lubrificantes
   - Baterias
   - Roupas e Equipamentos

### Marcas

Já existem marcas padrão:
- Honda, Yamaha, Kawasaki, Suzuki, Dafra, Shineray, Triumph, Ducati, BMW, Harley-Davidson

### Produtos

1. Vá em **Produtos > Novo Produto**
2. Cadastre seus produtos:
   - SKU (código manual)
   - Nome
   - Preço de custo
   - Preço de venda
   - Estoque inicial
   - Categoria
   - Marca
   - Imagens (opcional)

### Clientes

1. Vá em **Clientes > Novo Cliente**
2. Cadastre seus clientes

## Estrutura do Sistema

### Menu Principal

- **Dashboard**: Visão geral com KPIs
- **PDV**: Ponto de venda
- **Vendas**: Histórico de vendas
- **Comandas**: Contas a receber
- **Clientes**: Gestão de clientes
- **Produtos**: Catálogo de produtos
- **Estoque**: Controle de estoque
- **Financeiro**: (Admin) Fluxo de caixa
- **Despesas**: (Admin) Gestão de despesas
- **Relatórios**: (Admin) Relatórios administrativos
- **Usuários**: (Admin) Gestão de usuários
- **Configurações**: Configurações da empresa

### Permissões

**Admin:**
- Acesso completo
- Visualiza custos e margens
- Gestão de usuários
- Relatórios financeiros

**Funcionário:**
- PDV e vendas
- Consulta de produtos e estoque
- Não visualiza custos
- Acesso limitado a relatórios

## Fluxo de Uso

### Venda à Vista

1. Acesse **PDV**
2. Busque produto por código, nome ou código de barras
3. Adicione ao carrinho
4. Selecione forma de pagamento (Dinheiro, PIX, Débito, Crédito)
5. Se Dinheiro, informe valor recebido
6. Finalize venda
7. Imprima comprovante

### Venda a Prazo

1. Acesse **PDV**
2. Adicione produtos ao carrinho
3. Selecione cliente
4. Escolha "A Prazo"
5. Informe data de vencimento
6. Finalize venda
7. Uma comanda será criada automaticamente

### Pagamento de Comanda

1. Acesse **Comandas**
2. Encontre a comanda (pode filtrar por vencidas)
3. Clique em "Pagar"
4. Informe valor (total ou parcial)
5. Escolha forma de pagamento
6. Confirme

### Ajuste de Estoque

1. Acesse **Estoque**
2. Encontre o produto
3. Clique em "Ajustar"
4. Informe quantidade (positivo ou negativo)
5. Informe motivo
6. Confirme

## Troubleshooting

### Erro de Conexão Supabase

- Verifique se as variáveis de ambiente estão corretas
- Verifique se o projeto Supabase está ativo
- Verifique se o RLS está configurado corretamente

### Login Não Funciona

- Verifique se o usuário foi criado no Supabase
- Verifique se o profile tem `active: true`
- Verifique se o role está correto

### Imagens Não Carregam

- Verifique se o bucket `product-images` foi criado
- Verifique as políticas de storage
- Verifique se as políticas RLS estão corretas

### RLS Bloqueando Acesso

- As políticas RLS estão configuradas no schema.sql
- Verifique se foram executadas corretamente
- Verifique se o usuário tem as permissões necessárias

## Próximos Passos

1. Teste todos os módulos
2. Cadastre dados reais
3. Treine a equipe
4. Configure impressoras térmicas
5. Personalize comprovantes
6. Configure backups automáticos

## Suporte

Para problemas ou dúvidas:
- Consulte o README.md
- Verifique a documentação do Supabase
- Revise o schema.sql para entender a estrutura do banco

## Segurança

- Nunca compartilhe a `SUPABASE_SERVICE_ROLE_KEY`
- Use senhas fortes
- Mantenha o Next.js atualizado
- Configure HTTPS em produção
- Faça backups regulares do banco de dados
