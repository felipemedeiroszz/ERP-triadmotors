Crie um sistema ERP/PDV web completo, profissional, moderno e realmente funcional para uma loja de peças e acessórios para motocicletas chamada:

TRIAD MOTO PARTS

O sistema será utilizado para controlar vendas, estoque, clientes, vendas a prazo, comandas, financeiro, despesas e relatórios administrativos.

============================================================
1. TECNOLOGIAS OBRIGATÓRIAS
============================================================

Utilizar obrigatoriamente:

- React
- Next.js
- TypeScript
- Supabase
- PostgreSQL através do Supabase
- Supabase Auth
- Supabase Storage
- Tailwind CSS

O sistema deve ser responsivo e funcionar perfeitamente em:

- Desktop
- Notebook
- Tablet
- Celular

Criar uma PWA, permitindo instalação em dispositivos compatíveis.

IMPORTANTE:

Não criar apenas um protótipo visual.

O sistema deve ser FUNCIONAL, com:

- Banco de dados real
- Autenticação real
- CRUD real
- Supabase conectado
- RLS configurado
- Permissões reais
- Persistência dos dados
- Validações
- Tratamento de erros
- Loading states
- Feedback visual
- Relacionamentos entre tabelas

============================================================
2. IDENTIDADE VISUAL
============================================================

Utilizar a logo oficial da TRIAD MOTO PARTS fornecida.

Identidade visual:

- Preto
- Vermelho
- Branco
- Grafite
- Pequenos detalhes em cinza

Estilo:

- Premium
- Moderno
- Tecnológico
- Profissional
- Esportivo
- Relacionado ao universo de motocicletas

A interface deve parecer um ERP comercial profissional.

Não utilizar aparência genérica de sistema administrativo.

Criar:

- Sidebar moderna
- Header
- Cards
- Tabelas
- Gráficos
- Modais
- Dropdowns
- Toasts
- Badges de status
- Skeleton loading
- Empty states
- Confirmações
- Animações sutis
- Hover states
- Feedback de ações

Utilizar ícones modernos e consistentes.

============================================================
3. AUTENTICAÇÃO
============================================================

Utilizar Supabase Auth.

Criar:

- Login
- Logout
- Recuperação de senha
- Alteração de senha
- Controle de sessão

Tipos de usuário:

ADMIN
FUNCIONÁRIO

============================================================
4. PERMISSÕES
============================================================

ADMIN:

Acesso completo ao sistema.

FUNCIONÁRIO:

Pode:

- Acessar dashboard limitado
- Consultar produtos
- Consultar estoque
- Utilizar PDV
- Cadastrar/selecionar clientes conforme permissão
- Criar vendas
- Criar vendas a prazo
- Criar comandas
- Consultar suas vendas
- Imprimir comprovantes

Funcionário NÃO pode visualizar:

- Preço de custo
- Margem de lucro
- Despesas
- Resultado financeiro administrativo
- Relatórios financeiros sensíveis
- Informações administrativas restritas

IMPORTANTE:

As permissões devem ser protegidas pelo Supabase/RLS e pelo backend.

NÃO confiar apenas em esconder elementos no frontend.

Mesmo que um funcionário tente acessar uma rota ou consultar uma tabela diretamente, ele não poderá acessar informações não autorizadas.

============================================================
5. ESTRUTURA DO MENU
============================================================

Criar sidebar com:

- Dashboard
- PDV
- Vendas
- Comandas
- Clientes
- Produtos
- Estoque
- Financeiro
- Despesas
- Relatórios
- Usuários
- Configurações

O menu deve ser adaptado conforme o usuário.

============================================================
6. DASHBOARD ADMINISTRATIVO
============================================================

Criar dashboard moderno.

Exibir:

- Vendas do dia
- Vendas do mês
- Quantidade de vendas
- Ticket médio
- Contas a receber
- Contas vencidas
- Despesas do mês
- Resultado estimado
- Comandas abertas
- Comandas vencidas
- Produtos com estoque baixo

Criar gráficos:

- Vendas por dia
- Vendas por período
- Formas de pagamento
- Produtos mais vendidos
- Evolução do faturamento

Criar blocos:

"Produtos mais vendidos"

"Últimas vendas"

"Comandas em aberto"

"Clientes com maior débito"

============================================================
7. DASHBOARD FUNCIONÁRIO
============================================================

Mostrar apenas informações permitidas.

Exibir:

- Vendas do dia
- Quantidade de vendas
- Últimas vendas
- Produtos com estoque baixo
- Acesso rápido ao PDV
- Comandas abertas permitidas

Não mostrar:

- Custo
- Lucro
- Margem
- Despesas administrativas

============================================================
8. PRODUTOS
============================================================

Criar cadastro completo de produtos.

Campos:

- ID interno UUID
- Código/SKU
- Código de barras
- Nome
- Descrição
- Categoria
- Marca
- Modelo/aplicação
- Unidade
- Preço de custo
- Preço de venda
- Margem
- Estoque atual
- Estoque mínimo
- Fornecedor
- Status
- Imagens
- Data de criação
- Data de atualização

============================================================
9. CÓDIGO DO PRODUTO
============================================================

REGRA MUITO IMPORTANTE:

O código/SKU do produto será definido MANUALMENTE pelo administrador.

O sistema NÃO deve gerar automaticamente o código do produto.

Exemplo:

Código: 00125
Produto: Pastilha de freio Honda CG 160

Código: 00126
Produto: Óleo 10W40

Código: A001
Produto: Pneu Michelin

Regras:

- Administrador informa o código manualmente.
- O código deve ser único.
- Não permitir duplicidade.
- Permitir códigos numéricos.
- Permitir códigos alfanuméricos.
- Permitir editar o código posteriormente.
- Validar duplicidade antes de salvar.
- O código será utilizado nas buscas do PDV.
- O código será utilizado nas consultas de estoque.

IMPORTANTE:

O ID interno do banco pode ser UUID automático.

Porém o código comercial/SKU NÃO deve ser automático.

============================================================
10. CÓDIGO DE BARRAS
============================================================

Código de barras é diferente do código/SKU.

Criar campo separado:

barcode

O código de barras:

- É opcional.
- Será informado manualmente.
- Poderá ser utilizado no PDV.
- Poderá ser digitado ou lido por leitor de código de barras.

Busca do PDV deve aceitar:

- Código/SKU
- Código de barras
- Nome
- Marca
- Categoria

============================================================
11. IMAGENS DOS PRODUTOS
============================================================

Utilizar Supabase Storage.

Criar bucket:

product-images

Permitir ao administrador:

- Adicionar imagem
- Adicionar múltiplas imagens
- Visualizar
- Alterar
- Excluir
- Definir imagem principal

Formatos:

- JPG
- JPEG
- PNG
- WEBP

Criar limite de tamanho configurável.

Mostrar preview antes do upload.

Mostrar progresso de upload.

Estrutura recomendada:

product-images/
    {product_id}/
        image-1.webp
        image-2.webp
        image-3.webp

Criar tabela:

product_images

Campos:

- id
- product_id
- storage_path
- url/referência
- is_primary
- created_at

O banco não deve armazenar a imagem diretamente.

Deve armazenar somente a referência/caminho da imagem.

Imagem principal deve aparecer em:

- Produtos
- Estoque
- PDV
- Detalhes do produto
- Histórico de vendas quando apropriado
- Relatórios quando apropriado

Funcionários podem visualizar imagens.

Funcionários não podem excluir ou alterar imagens.

============================================================
12. ESTOQUE
============================================================

Criar controle completo de estoque.

Funcionalidades:

- Entrada
- Saída
- Ajuste
- Inventário
- Estoque mínimo
- Produtos sem estoque
- Produtos com estoque baixo
- Histórico de movimentações

Toda movimentação deve registrar:

- Produto
- Tipo
- Quantidade
- Usuário
- Data/hora
- Motivo
- Referência da operação

Ao realizar uma venda:

ESTOQUE DIMINUI AUTOMATICAMENTE.

Ao cancelar/devolver uma venda:

ESTOQUE DEVE SER REAJUSTADO.

============================================================
13. PDV
============================================================

Criar um PDV rápido e profissional.

O operador poderá:

- Pesquisar produto
- Pesquisar por código
- Pesquisar por código de barras
- Pesquisar por nome
- Pesquisar por marca
- Adicionar produto
- Alterar quantidade
- Remover produto
- Aplicar desconto conforme permissão
- Selecionar cliente
- Finalizar venda

Mostrar imagem do produto quando disponível.

Carrinho:

- Produto
- Imagem
- Código
- Quantidade
- Preço
- Desconto
- Subtotal

Formas de pagamento:

- Dinheiro
- PIX
- Débito
- Crédito
- A prazo

============================================================
14. DINHEIRO
============================================================

Quando pagamento for dinheiro:

Informar:

Valor recebido

Calcular automaticamente:

Troco

Exemplo:

Total: R$ 80

Recebido: R$ 100

Troco: R$ 20

============================================================
15. VENDA A PRAZO
============================================================

Quando selecionar:

A PRAZO

O sistema deverá:

1. Solicitar cliente.
2. Caso não exista, permitir cadastrar.
3. Informar vencimento.
4. Criar a venda.
5. Criar uma comanda.
6. Criar conta a receber.
7. Registrar a venda.
8. Baixar o estoque.

============================================================
16. COMANDAS
============================================================

REGRA:

Cada venda a prazo terá sua própria comanda.

Um cliente pode possuir várias comandas.

Exemplo:

Cliente João:

Comanda #001
R$ 150
Vencimento 10/10

Comanda #002
R$ 320
Vencimento 20/10

Comanda #003
R$ 200
Vencimento 30/10

No cadastro do cliente mostrar:

- Quantidade de comandas
- Comandas abertas
- Comandas pagas
- Comandas vencidas
- Total em aberto
- Total vencido

Criar filtros:

- Todas
- Abertas
- Pagas
- Vencidas
- Canceladas
- Por cliente
- Por período
- Por vencimento

============================================================
17. PAGAMENTO DE COMANDAS
============================================================

Permitir:

- Pagamento total
- Pagamento parcial

Exemplo:

Comanda:

R$ 500

Cliente paga:

R$ 200

Sistema deve mostrar:

Pago: R$ 200
Saldo: R$ 300

Registrar:

- Valor
- Data
- Usuário
- Forma de pagamento
- Comanda
- Cliente

Ao quitar:

Status:

PAGA

============================================================
18. CLIENTES
============================================================

Criar cadastro:

- Nome
- CPF/CNPJ
- Telefone
- WhatsApp
- E-mail
- Endereço
- Número
- Bairro
- Cidade
- Estado
- CEP
- Observações
- Limite de crédito
- Status

Na página do cliente mostrar:

- Dados
- Total de compras
- Total em aberto
- Total vencido
- Número de comandas
- Histórico de compras
- Histórico de pagamentos

Criar botão:

"Ver comandas"

============================================================
19. HISTÓRICO DE VENDAS
============================================================

Criar tela de vendas.

Filtros:

- Número da venda
- Cliente
- Funcionário
- Data
- Período
- Forma de pagamento
- Status
- Valor

Ao abrir uma venda:

Mostrar:

- Número
- Data
- Hora
- Cliente
- Funcionário
- Produtos
- Quantidades
- Preços
- Descontos
- Total
- Forma de pagamento
- Comanda
- Status

Permitir:

- Visualizar
- Reimprimir
- Gerar PDF

============================================================
20. COMPROVANTE NÃO FISCAL
============================================================

Toda venda deve gerar um comprovante.

Não é documento fiscal.

Criar layout profissional.

Compatibilidade:

- Impressora térmica 58mm
- Impressora térmica 80mm
- A4
- PDF

Conteúdo:

Logo TRIAD MOTO PARTS

Nome da empresa

CNPJ configurável

Telefone configurável

Endereço configurável

Número da venda

Data/hora

Funcionário

Cliente

Produtos

Quantidade

Preço

Desconto

Total

Forma de pagamento

Para venda a prazo:

- Número da comanda
- Vencimento
- Valor em aberto

Rodapé:

"COMPROVANTE DE VENDA — NÃO É DOCUMENTO FISCAL"

Botões:

- Imprimir
- Gerar PDF
- Reimprimir

============================================================
21. FINANCEIRO
============================================================

Criar módulo financeiro administrativo.

Mostrar:

- Entradas
- Saídas
- Contas a receber
- Recebimentos
- Valores vencidos
- Fluxo de caixa
- Resultado por período

Integrações automáticas:

Venda à vista
→ Entrada

Venda a prazo
→ Conta a receber

Pagamento de comanda
→ Entrada financeira

Despesa
→ Saída

============================================================
22. DESPESAS
============================================================

Criar cadastro de despesas.

Campos:

- Descrição
- Categoria
- Valor
- Data
- Vencimento
- Forma de pagamento
- Status
- Observação
- Recorrência

Status:

- Pendente
- Pago
- Vencido
- Cancelado

============================================================
23. RELATÓRIOS
============================================================

Criar módulo de relatórios ADMINISTRATIVOS.

Relatórios:

- Vendas
- Faturamento
- Produtos mais vendidos
- Estoque
- Produtos sem estoque
- Produtos com estoque baixo
- Clientes
- Comandas
- Contas a receber
- Contas vencidas
- Despesas
- Fluxo financeiro
- Vendas por funcionário
- Vendas por forma de pagamento

Filtros:

- Hoje
- Ontem
- Últimos 7 dias
- Este mês
- Mês anterior
- Personalizado

Permitir:

- Imprimir
- Gerar PDF
- Exportar CSV/Excel quando possível

============================================================
24. USUÁRIOS
============================================================

Somente ADMIN.

Permitir:

- Criar usuário
- Editar
- Ativar
- Desativar
- Alterar função
- Resetar senha

Funções:

ADMIN
FUNCIONÁRIO

============================================================
25. AUDITORIA
============================================================

Criar tabela audit_logs.

Registrar ações importantes:

- Login
- Logout
- Criação de produto
- Alteração de produto
- Exclusão/inativação
- Entrada de estoque
- Ajuste de estoque
- Venda
- Cancelamento
- Recebimento
- Criação de despesa
- Alteração de configurações

Registrar:

- Usuário
- Ação
- Entidade
- ID
- Data/hora
- Informações relevantes

============================================================
26. ABERTURA E FECHAMENTO DE CAIXA
============================================================

Criar controle de caixa.

Permitir:

- Abrir caixa
- Informar valor inicial
- Registrar vendas
- Registrar entradas
- Registrar saídas
- Fechar caixa

No fechamento mostrar:

- Dinheiro esperado
- PIX
- Débito
- Crédito
- Vendas a prazo
- Total vendido
- Sangrias
- Suprimentos
- Valor informado pelo operador
- Diferença

Registrar o usuário responsável pelo caixa.

============================================================
27. CONFIGURAÇÕES
============================================================

Criar configurações da empresa:

- Logo
- Nome
- CNPJ
- Telefone
- WhatsApp
- Endereço
- Cidade
- Estado
- CEP

Configurações de:

- Estoque
- Impressão
- PDV
- Comprovante
- Usuários
- Permissões

============================================================
28. BANCO DE DADOS
============================================================

Criar banco PostgreSQL no Supabase.

Estruturar tabelas corretamente.

Sugestão:

profiles
roles
products
product_images
categories
brands
suppliers
customers
sales
sale_items
payments
commands
command_items
receivables
receivable_payments
expenses
stock_movements
cash_registers
cash_movements
audit_logs
company_settings

Utilizar:

- UUID
- Foreign Keys
- Constraints
- Indexes
- Timestamps
- Triggers quando necessário

Criar relacionamentos corretamente.

============================================================
29. RLS SUPABASE
============================================================

Configurar Row Level Security.

ADMIN possui acesso completo.

FUNCIONÁRIO possui acesso somente ao que sua função permite.

Proteger:

- Produtos
- Custos
- Financeiro
- Despesas
- Relatórios
- Usuários
- Auditoria

Nunca confiar somente em autorização no frontend.

============================================================
30. PERFORMANCE
============================================================

Priorizar performance.

Utilizar:

- Server Components quando apropriado
- Client Components apenas quando necessário
- Queries eficientes
- Paginação
- Debounce
- Lazy loading
- Cache quando apropriado
- Imagens otimizadas
- Consultas Supabase eficientes

O PDV deve ser rápido.

============================================================
31. RESPONSIVIDADE
============================================================

Desktop:

Sidebar completa.

Tablet:

Layout adaptado.

Celular:

Sidebar vira menu mobile.

Cards e tabelas devem se adaptar.

O PDV deve continuar sendo fácil de utilizar no celular/tablet.

============================================================
32. UX
============================================================

Nenhuma tela deve ficar sem feedback.

Implementar:

Loading
Skeleton
Empty state
Error state
Success state
Toast
Modal de confirmação

Exemplo:

Ao excluir:

"Tem certeza que deseja excluir este produto?"

Ao salvar:

"Produto cadastrado com sucesso."

Ao finalizar venda:

"Venda realizada com sucesso."

============================================================
33. ESTRUTURA DO PROJETO
============================================================

Organizar o código profissionalmente.

Exemplo:

/app
/components
/lib
/services
/hooks
/types
/utils
/supabase
/features
/styles

Separar lógica de negócio da interface.

Utilizar TypeScript fortemente tipado.

Criar componentes reutilizáveis.

Evitar código duplicado.

============================================================
34. SEGURANÇA
============================================================

Implementar:

- Supabase Auth
- RLS
- Controle de permissões
- Validação
- Proteção de rotas
- Sanitização
- Controle de sessão
- Logs
- Proteção contra acesso indevido

Não expor:

- Service Role Key
- Credenciais
- Secrets

Utilizar variáveis de ambiente.

============================================================
35. SUPABASE STORAGE
============================================================

Utilizar Supabase Storage para:

- Imagens dos produtos
- Logo da empresa
- Futuras imagens/documentos

Bucket:

product-images

Configurar políticas adequadas.

============================================================
36. EXPERIÊNCIA DO PDV
============================================================

O PDV deve ser uma das telas mais bem desenvolvidas.

Layout:

Lado esquerdo:

Busca de produtos.

Lado direito:

Carrinho.

Mostrar:

Imagem
Produto
Código
Preço
Estoque
Quantidade

Botão:

Adicionar

Carrinho:

Produto
Quantidade
Preço
Desconto
Subtotal

Finalização:

Dinheiro
PIX
Débito
Crédito
A prazo

Criar atalhos de teclado quando apropriado.

============================================================
37. CLIENTE COM VÁRIAS COMANDAS
============================================================

O sistema deve permitir que um cliente tenha quantas comandas forem necessárias.

Exemplo:

João Silva

8 comandas

3 abertas

1 vencida

Total em aberto:

R$ 780,00

Permitir visualizar todas as comandas do cliente.

Permitir filtrar:

- Abertas
- Pagas
- Vencidas
- Canceladas

============================================================
38. PESQUISA GLOBAL
============================================================

Criar busca rápida para:

- Produtos
- Clientes
- Vendas
- Comandas

Produtos:

Código
Código de barras
Nome
Marca

Clientes:

Nome
CPF
Telefone
WhatsApp

============================================================
39. DESIGN FINAL
============================================================

O sistema deve ter aparência de produto comercial.

Não utilizar excesso de cores.

Principal:

Preto

Secundária:

Vermelho

Textos:

Branco/cinza

Status:

Verde
Amarelo
Vermelho

Criar excelente contraste.

Utilizar bordas arredondadas moderadamente.

Criar hierarquia visual.

============================================================
40. DADOS DEMONSTRATIVOS
============================================================

Durante o desenvolvimento, criar dados fictícios para demonstração:

Produtos
Clientes
Vendas
Comandas
Despesas

Porém estruturar o sistema para que esses dados possam ser removidos posteriormente.

============================================================
41. IMPORTANTE SOBRE O BANCO DE DADOS
============================================================

O banco de dados deve começar utilizando o plano gratuito do Supabase.

O sistema deve ser desenvolvido de forma eficiente para reduzir consumo desnecessário.

Caso o projeto ultrapasse os limites do plano gratuito, poderá ser necessário utilizar um plano pago do Supabase.

O sistema deve funcionar normalmente após upgrade do plano.

============================================================
42. FLUXO PRINCIPAL
============================================================

FLUXO DE VENDA À VISTA:

Login
↓
PDV
↓
Selecionar produto
↓
Carrinho
↓
Selecionar pagamento
↓
Finalizar
↓
Registrar venda
↓
Baixar estoque
↓
Registrar entrada
↓
Gerar comprovante
↓
Imprimir

FLUXO DE VENDA A PRAZO:

Login
↓
PDV
↓
Selecionar produtos
↓
Selecionar cliente
↓
Selecionar "A prazo"
↓
Definir vencimento
↓
Criar comanda
↓
Criar conta a receber
↓
Baixar estoque
↓
Gerar comprovante
↓
Imprimir

FLUXO DE PAGAMENTO:

Cliente
↓
Comandas
↓
Selecionar comanda
↓
Registrar pagamento
↓
Atualizar saldo
↓
Registrar entrada financeira
↓
Atualizar status
↓
Gerar comprovante de pagamento

============================================================
43. QUALIDADE DO CÓDIGO
============================================================

O código deve ser:

- Limpo
- Organizado
- Modular
- Escalável
- Tipado
- Seguro
- Comentado quando necessário
- Sem código desnecessário
- Sem duplicação

Não criar funcionalidades falsas.

Não utilizar dados mockados como substituição do banco real.

Todas as funcionalidades principais devem estar conectadas ao Supabase.

============================================================
44. RESULTADO FINAL
============================================================

Entregar um ERP completo chamado:

TRIAD MOTO PARTS

Slogan:

"Mais controle para o seu negócio."

O resultado deve transmitir:

- Profissionalismo
- Tecnologia
- Velocidade
- Segurança
- Organização
- Facilidade de uso

O sistema deve parecer um produto SaaS/ERP comercial pronto para ser utilizado por uma loja real.

Comece pela arquitetura do projeto e banco de dados.

Depois implemente:

1. Autenticação
2. Layout
3. Permissões
4. Produtos
5. Supabase Storage
6. Estoque
7. Clientes
8. PDV
9. Vendas
10. Comandas
11. Financeiro
12. Despesas
13. Relatórios
14. Caixa
15. Auditoria
16. Configurações

Teste cada módulo antes de avançar para o próximo.

Não avance deixando funcionalidades quebradas ou apenas visuais.