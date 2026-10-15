# Cadastros importados e pendências

A gestão possui um módulo exclusivo **Pendências cadastrais**, visível apenas à equipe autorizada. O resumo informa registros importados, atendimentos vinculados e cadastros que ainda precisam de dados ou ativação de acesso. A lista tem busca por nome e paginação.

Cada registro conserva a página e a linha de origem. Nome, documento e contatos da entrada são guardados somente no banco privado; o payload fica criptografado. O arquivo original e a extração local não são versionados. A importação é identificada pelo SHA-256 e repeti-la não duplica registros.

Documento completo com dígitos verificadores válidos e nome suficiente permite preparar o cadastro e o atendimento. CPF e CNPJ numérico são aceitos. Não se deduzem dígitos ocultos, nomes completos, e-mails ou resultados dos órgãos. Documentos ausentes, parcialmente ocultos ou inválidos e nomes ambíguos ficam sinalizados.

Novos atendimentos começam com SPC, Serasa, Boa Vista e Protestos em **A confirmar**. Importações não alteram status de atendimentos já existentes. O evento inicial registra a data da importação, sem inventar data de contratação ou início do serviço.

É possível salvar uma conferência parcial sem perder os dados já preenchidos. Com nome, documento e e-mail conferidos, o administrador gera o convite individual. Não há disparo automático de mensagens. A pendência de acesso permanece até existir uma conta de cliente ativa vinculada ao cadastro.

Clientes entram com **e-mail, CPF/CNPJ e senha individual**, definida por convite. CPF e e-mail não constituem senha. A gestão conserva o acesso de equipe por e-mail e senha. O servidor confirma o documento somente depois de validar as credenciais e não entrega sessão de cliente quando o documento não corresponde a um vínculo ativo.

E-mail já vinculado a outro cadastro ou documento associado a outro nome exige conferência. Não conceder acesso a terceiros por associação presumida. As alterações são auditadas, e clientes não podem consultar a fila ou os dados de origem.

## Operação técnica

Aplicar `db/003_registrations.sql` pelo migrador existente. Preparar a extração na pasta `.local-data/` ignorada e executar o importador primeiro sem `--apply` para conferir os totais. A execução com `--apply` exige um administrador ativo configurado em `SAUVID_ADMIN_EMAIL`. O script imprime somente totais e identificadores do lote; não imprime documentos ou payloads.

Testes de domínio/RLS usam somente registros artificiais. O E2E usa banco temporário exclusivo, sem copiar dados de produção. Evidências de importações reais ficam na pasta privada local e no banco, fora do GitHub.
