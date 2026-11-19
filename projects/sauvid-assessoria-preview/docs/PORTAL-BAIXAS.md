# Operação do acompanhamento de baixas

## Acessos

Na prévia, use as duas contas fictícias fornecidas com a entrega. A gestão abre em `/gestao/credito` e o cliente entra em `/acompanhar`. Os dois endereços usam o login individual do projeto. A gestão aceita também as chaves de acesso já cadastradas no respectivo domínio. A rota institucional anterior continua válida.

No ambiente oficial, Junior usa sua conta administrativa existente. Para o primeiro administrador de um ambiente novo, configure o e-mail autorizado em `SAUVID_ADMIN_EMAIL` e execute `node --env-file=.env.local scripts/prepare-admin.cjs` em uma máquina de confiança. O script de ativação local verifica a existência da conta e oferece um convite temporário. O titular escolhe a senha. O cadastro de uma chave em **Digital e segurança** exige a participação pessoal do titular.

## Cadastrar e vincular

1. Em **Atendimentos**, escolha **Cadastrar atendimento**. Informe PF/PJ, documento, nome, e-mail conferido e escopo. Preencha lote e protocolo quando conhecidos. Confira a representação de pessoa jurídica antes de marcar a verificação. O mesmo documento pode ter vários atendimentos.
2. Na ficha, use **Convidar este cliente** para uma conta nova. Entregue o convite diretamente ao titular após conferir a identidade. Para uma conta existente com contato verificado, use **Vincular conta existente**. O vínculo abrange os atendimentos do mesmo cliente. **Revogar vínculo** retira esse acesso.
3. Para uma ocorrência inconclusiva, registre uma nota interna. Processo não localizado ou falha de conferência conserva o último estado publicado.

## Publicar, corrigir e liberar arquivos

1. Na ficha, selecione SPC, Serasa, Boa Vista ou Cartório. Informe situação, origem, abrangência, data de verificação e mensagem. Deixe a data do fato vazia se desconhecida.
2. Para confirmar uma baixa, anexe e revise a evidência no mesmo atendimento e órgão. Selecione o arquivo no rascunho. Para cartório, indique o ato documentado.
3. Clique em **Salvar rascunho e revisar**. Confira destinatário, documento mascarado, protocolo, situação anterior e mensagem. Clique em **Confirmar destinatário e publicar este rascunho**. O cliente verá a publicação ao atualizar sua página.
4. Para corrigir a publicação atual, marque **Corrigir a publicação atual** e informe o motivo. Uma nova publicação conserva o evento anterior. Se outra pessoa publicou, reabra a ficha e compare o estado atualizado.
5. Um anexo interno pode servir de evidência. Use **Liberar ao cliente** apenas para os arquivos que o titular pode consultar. A retirada da liberação impede novos downloads. O histórico interno exportado contém dados restritos.
6. Para encerrar, todos os órgãos aplicáveis devem ter baixa confirmada com comprovação. O painel trabalha com lançamentos manuais da SAUVID.

## Migração, backup e reversão

O código parte do projeto Vercel SAUVID, com PostgreSQL, Better Auth e armazenamento Blob privado. A migração incremental está em `db/005_credit.sql`. Ela cria rascunhos privados com segurança por linha, preserva o histórico e recupera protocolos de solicitações com correspondência inequívoca. Dados de setembro não devem ser usados como estados atuais.

Antes de publicar, registre a implantação atual da SAUVID e o ponto de recuperação do PostgreSQL. Faça backup consistente do banco, por exemplo com `pg_dump --format=custom` usando conexão fornecida fora do histórico do shell. Guarde a cópia em local privado com retenção definida. Conserve separadamente as chaves de criptografia e busca. Faça inventário dos objetos privados referenciados em `case_files`, copie-os para armazenamento privado de backup e confira tamanho e SHA-256. Uma cópia SQL contém metadados dos arquivos.

Restaure a cópia em banco isolado com `pg_restore --exit-on-error` e restaure os objetos em armazenamento privado de homologação. Verifique contagens, vínculos, conteúdo de amostra e integridade de arquivo antes de aplicar a migração. Em banco já operacional, aplique apenas a 005 dentro de transação com parada ao primeiro erro. Para ambiente novo, use o migrador completo do projeto. Configure os segredos no provedor e mantenha a integração de arquivos em modo privado. Publique o código compatível após a migração e execute a jornada funcional em homologação.

Se o código precisar voltar, promova a implantação anterior e suspenda publicações de situação até conferir a compatibilidade dos escritores antigos com o histórico versionado. Preserve as tabelas e as publicações realizadas. Uma restauração em produção exige delimitar a janela e reconciliar as gravações posteriores ao backup.

## Dados e privacidade

A área do cliente usa o vínculo da sessão e a projeção publicada. A equipe deve registrar a finalidade, a retenção dos documentos e do histórico, os destinatários autorizados e o atendimento dos pedidos do titular na documentação institucional. A revisão jurídica e a política de retenção de produção dependem do responsável.
