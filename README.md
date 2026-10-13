# TRIAD MOTO PARTS - ERP/PDV System

Sistema ERP/PDV completo e profissional para loja de peças e acessórios para motocicletas.

## Tecnologias

- Next.js 16
- React 19
- TypeScript
- Supabase (PostgreSQL, Auth, Storage)
- Tailwind CSS
- shadcn/ui
- Recharts

## Configuração Inicial

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Aguarde a inicialização do projeto

### 2. Configurar Variáveis de Ambiente

1. No painel do Supabase, vá em Settings > API
2. Copie as credenciais
3. Crie o arquivo `.env.local` na raiz do projeto:

```bash
cp .env.example .env.local
```

4. Edite `.env.local` com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Executar Schema do Banco de Dados

1. No painel do Supabase, vá em SQL Editor
2. Crie uma nova query
3. Copie e execute o conteúdo de `supabase/schema.sql`

### 4. Configurar Storage

1. No painel do Supabase, vá em Storage
2. Crie um novo bucket chamado `product-images`
3. Marque como **não público**
4. Defina limite de tamanho (recomendado: 5MB)
5. No SQL Editor, execute o conteúdo de `supabase/storage-setup.sql`

### 5. Criar Usuário Admin Inicial

Execute no SQL Editor:

```sql
-- Cria usuário admin inicial
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

Ou use a interface de autenticação do Supabase para criar o primeiro usuário.

### 6. Instalar Dependências

```bash
pnpm install
```

### 7. Executar Projeto

```bash
pnpm dev
```

Acesse: http://localhost:3000

## Estrutura do Projeto

```
├── app/                    # Páginas Next.js
├── components/            # Componentes React
│   └── ui/                # Componentes shadcn/ui
├── lib/                   # Utilitários e configurações
│   ├── supabase/         # Client Supabase
│   ├── auth.ts           # Autenticação
│   ├── types.ts          # Tipos TypeScript
│   └── utils.ts          # Funções auxiliares
├── supabase/             # Scripts SQL
│   ├── schema.sql        # Schema do banco
│   └── storage-setup.sql # Políticas de storage
└── public/               # Arquivos estáticos
```

## Módulos

- **Dashboard**: Visão geral com KPIs e gráficos
- **PDV**: Ponto de venda rápido e intuitivo
- **Vendas**: Histórico e detalhes de vendas
- **Comandas**: Contas a receber e pagamentos
- **Clientes**: Cadastro e histórico
- **Produtos**: Gestão completa de produtos
- **Estoque**: Controle de movimentações
- **Financeiro**: Fluxo de caixa e relatórios
- **Despesas**: Gestão de despesas
- **Relatórios**: Relatórios administrativos
- **Usuários**: Gestão de usuários (admin)
- **Configurações**: Configurações da empresa

## Permissões

### Admin
- Acesso completo ao sistema
- Visualiza custos e margens
- Gestão de usuários
- Relatórios financeiros completos

### Funcionário
- PDV e vendas
- Consulta de produtos e estoque
- Não visualiza custos
- Acesso limitado a relatórios

## Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) no banco
- Proteção de rotas
- Validação de dados
- Logs de auditoria

## Desenvolvimento

### Adicionar novo componente shadcn/ui

```bash
npx shadcn@latest add [component-name]
```

### Build para produção

```bash
pnpm build
```

### Iniciar produção

```bash
pnpm start
```

## Suporte

Para problemas ou dúvidas, consulte a documentação do projeto.
