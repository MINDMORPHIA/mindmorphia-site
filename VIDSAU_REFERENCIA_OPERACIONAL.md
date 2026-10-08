# Referência operacional VIDSAU → MindMorphia
Atualização: 08/10/2026.

## Confirmado no histórico do projeto
- VIDSAU teve implementação/testes anteriores de checkout Mercado Pago Checkout Pro, incluindo Pix, retorno e registros de aprovação.
- MindMorphia opera hoje com GitHub + Vercel e branch separada.
- O usuário decidiu replicar o **modelo operacional**, não compartilhar dados nem credenciais entre as marcas.

## Não verificado por acesso ao código real
- Código original ou versão exata do checkout VIDSAU.
- Provedor/banco de dados usado na VIDSAU ou Grupo SV.
- Disponibilidade atual do checkout VIDSAU em produção.
- Forma exata de webhook, autenticação, controle de pedidos e áreas administrativas.

## Decisões para implementação
1. Preservar conta e credenciais de pagamento da MindMorphia separadas.
2. Aplicar fluxo catálogo → pedido pendente → checkout oficial Mercado Pago → webhook validado + consulta de status → pedido pago → notificação/atendimento.
3. Manter histórico financeiro segregado, com minimização de dados pessoais.
4. Usar PostgreSQL como **modelo de schema sugerido**, não assumir que a VIDSAU já usa esse banco.
5. Não ativar CHECKOUT_ENABLED nem executar migrações antes de determinar infraestrutura, permissões e testar.
6. Não afirmar que o checkout foi copiado da VIDSAU: apenas sua operação foi usada como inspiração até obter código.
