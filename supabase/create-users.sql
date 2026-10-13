-- TRIAD MOTO PARTS - Criação de Usuários
-- Execute este arquivo no SQL Editor do Supabase

-- ============================================================================
-- USUÁRIO ADMINISTRADOR
-- ============================================================================

-- Opção 1: Usando SQL direto (mais simples)
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
)
ON CONFLICT (email) DO NOTHING;

-- O trigger criará automaticamente o profile na tabela profiles

-- ============================================================================
-- USUÁRIO FUNCIONÁRIO (LOJA)
-- ============================================================================

INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  'loja@triadmoto.com',
  crypt('loja123', gen_salt('bf')),
  NOW(),
  '{"full_name": "Funcionário Loja", "role": "employee"}'::jsonb
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Verificar se os usuários foram criados
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.raw_user_meta_data->>'full_name' as full_name,
  u.raw_user_meta_data->>'role' as role,
  p.active,
  p.created_at
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email IN ('admin@triadmoto.com', 'loja@triadmoto.com')
ORDER BY u.email;

-- ============================================================================
-- INSTRUÇÕES DE USO
-- ============================================================================

-- Após executar este SQL, você pode fazer login com:

-- ADMINISTRADOR:
-- Email: admin@triadmoto.com
-- Senha: admin123

-- FUNCIONÁRIO:
-- Email: loja@triadmoto.com
-- Senha: loja123

-- Recomendação: Altere as senhas após o primeiro login em Configurações > Usuários
-- ou usando a função de recuperação de senha.
