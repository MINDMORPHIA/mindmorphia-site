# Preparação do banco de pedidos
O arquivo `001_orders.sql` documenta o esquema previsto em PostgreSQL. Ainda não foi executado nem conectado a um banco de produção.

## Antes de ativar
1. Verificar qual banco e serviço são realmente usados no Grupo SV e/ou VIDSAU — não presumir.
2. Criar ambiente segregado para a MindMorphia, armazenamento criptografado, backup e controle de acesso.
3. Executar migração após revisão; confirmar requisitos LGPD e política de retenção.
4. Configurar `DATABASE_URL` apenas em variáveis de ambiente na Vercel.
5. O checkout atual permanece bloqueado. Usar o banco não ativa sozinho nenhum pagamento.

**Segurança:** nenhuma chave, URL com senha, informação pessoal ou dado de cartão deve ser commitado no repositório.
