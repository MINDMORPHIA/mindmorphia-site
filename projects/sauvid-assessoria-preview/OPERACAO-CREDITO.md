# SAUVID Assessoria | Portal de acompanhamento
**Entrega de homologação · 17/11/2026.** O código implementa o cadastro, a atualização manual e a consulta individual no site. Não consulta bureaus. A área institucional continua no mesmo projeto. A rota antiga de demonstração administrativa continua separada, sem vínculo com o banco do portal.

## Experimentar sem contas reais
Com Python 3.10+ e a pasta deste pacote aberta no terminal, execute `python testes/demonstrar.py`. O navegador abre na gestão local. Se necessário, visite http://127.0.0.1:8765/gestao. O banco SQLite temporário contém dois titulares fictícios, sem senhas nem dados importados. As identidades simuladas existem somente neste programa de demonstração; jamais o exponha à internet.

1. Na gestão, abra **Titular fictício A → P1-TESTE**. Registre a abrangência, origem, verificação e mensagem para um órgão. Se a data do fato é desconhecida, deixe-a em branco.
2. Salve o rascunho. Clique em **Cliente A**: o status continua “A confirmar”. Volte à gestão, confira titular, protocolo, antes/depois, mensagem e PDF; clique em **Revisar e publicar**.
3. Volte a **Cliente A**. Apenas o órgão escolhido mudou. Abra **Cliente B**: o atendimento de A não aparece. Para retificar, crie outra atualização para o mesmo órgão e preencha o motivo; a primeira fica no histórico.
4. **Baixa confirmada** exige evidência em PDF. Para que o cliente receba o arquivo, marque a liberação antes de publicar. A evidência sem essa marca fica interna. Para cartório, registre o ato exato (cancelamento, suspensão ou sustação) e seu alcance. Erro de consulta não é prova de baixa: mantenha a situação vigente.
5. Encerrar a demonstração com Ctrl+C apaga o banco temporário.

## Preparar a homologação no projeto correto
Repositório MINDMORPHIA/mindmorphia-site; base sauvid-preview; raiz da implantação projects/sauvid-assessoria-preview. O projeto Vercel indicado no README é sauvid-assessoria. Confirmar a equipe proprietária: o projeto não apareceu na equipe acessível durante a entrega. Revisar a alteração em prévia separada. Não importar a lista histórica.

Usar PostgreSQL privado e Supabase Auth com e-mail e senha, confirmação de identidade, cadastro público desativado, proteção contra tentativas e TOTP habilitado. Configurar credenciais de teste e de produção separadamente. Não expor o schema sauvid_credito pela Data API. Os PDFs de até 2 MB ficam em coluna binária no mesmo banco e participam das transações e do backup. O banco guarda HMAC do documento e quatro dígitos finais; não precisa recuperar o CPF integral.

No ambiente da função, definir SV_DATABASE_URL (conexão PostgreSQL TLS com credencial exclusiva), SV_AUTH_URL, SV_AUTH_PUBLIC_KEY (chave pública do provedor), SV_DOC_KEY (segredo aleatório de pelo menos 32 caracteres, estável e guardado em cofre) e SV_ADMIN_SUBJECT (UUID da conta verificada de Junior). Não inserir segredos no Git. Não usar a chave service_role. Configurar HTTPS. Limitar o login por origem na hospedagem e observar os limites de autenticação do provedor.

Antes da migração, criar backup privado e verificar que restaura. Aplicar como proprietário com `psql -v ON_ERROR_STOP=1 -f operacao/migrar.sql` usando conexão administrativa segura (configuração local do PostgreSQL). Conceder à conta de execução USAGE no schema, SELECT/INSERT nas tabelas e UPDATE apenas de sv_clients.active, sv_cases.stage e sv_events.published/reviewer; não conceder DELETE, DDL ou alteração de registros de auditoria. A conta de execução não deve ser proprietária. Informar a conexão dessa conta à aplicação. Não reutilizar o banco de produção no preview.

## Ativar e operar
Criar pelo provedor a conta de Junior de forma privada. Conferir identidade, e-mail e UUID; realizar definição privada de senha pelo fluxo controlado da empresa. Na máquina privada de Junior, definir SV_AUTH_URL, SV_AUTH_PUBLIC_KEY e SV_ADMIN_SUBJECT e executar `python operacao/ativar_mfa.py`. Não compartilhar a chave do autenticador. A gestão só funciona após validar o segundo fator. Sem configuração o serviço deve falhar fechado. O portal usa cookie HttpOnly com expiração máxima de 30 minutos. Para recuperar acesso, validar o titular por canal já cadastrado; utilizar o procedimento administrativo de redefinição do provedor, revogar sessões, e revalidar o fator se necessário. Não enviar credenciais pelo chat.

Acessar /gestao/credito. Criar no provedor uma conta para o cliente verificado e associar ao cadastro interno pelo UUID correto; conferir titularidade antes de salvar o vínculo. Cadastrar nome e CPF/CNPJ; abrir protocolo distinto para P1/P2. O cliente entra em /acompanhar pelo botão do site; suas permissões são resolvidas no servidor. Para remover o acesso de um cliente, usar “Revogar acesso” na ficha; vale também para downloads. Exportação JSON na gestão inclui histórico publicado e documento mascarado; guardar em local restrito. Não é backup.

## Backup, recuperação e reversão
Configurar snapshots automáticos criptografados sob controle da empresa; registrar responsáveis, frequência, retenção e objetivo de recuperação antes da entrada em produção. Para cópia lógica com credencial de backup: `pg_dump -Fc -n sauvid_credito -f sauvid_credito.dump`. Restaurar em banco de teste vazio com `pg_restore --exit-on-error --no-owner -d banco_de_teste sauvid_credito.dump`, conferir vínculos/contagens, baixar PDF autorizado, testar isolamento e reaplicar permissões. Guardar o segredo HMAC e o inventário de UUIDs no cofre; backup do banco da aplicação não substitui recuperação das identidades/MFA do provedor.

Para reverter o site, restaurar a implantação anterior no projeto correto sem apagar tabelas. Suspender novas publicações durante o diagnóstico. Restauração de dados exige backup validado e análise de atualizações posteriores; não rodar DROP como rollback.

## Evidência de validação e limites
Executado: `python testes/test_portal.py`, usando SQLite persistente em arquivo, conexões reabertas por operação e duas identidades fictícias. Os testes cobrem rascunho invisível, exigência de prova, publicação repetida sem duplicação, conflito de versão, retificação com histórico, independência dos quatro órgãos, bloqueio de encerramento parcial, bloqueio de ações administrativas, PDF privado, revogação, rejeição de documento repetido e restauração local de uma cópia. Sintaxe Python e JavaScript verificadas.

Ainda não validado em serviço hospedado: login real e MFA, migração PostgreSQL e privilégios, backup/restauração PostgreSQL, implantação Vercel, caminhos e cookies em HTTPS. O teste de navegador em testes/telas.py foi preparado, mas o Chromium não iniciou neste ambiente (bloqueio de socket); capturas e conferência visual em celular/desktop devem ser feitas na homologação. Não há URL pública nova confirmada. Antes de liberar clientes, repetir o ciclo acima com duas identidades de homologação e dados fictícios e verificar também o suporte e a recuperação de acesso.

Referências operacionais: [Supabase Auth — TOTP](https://supabase.com/docs/guides/auth/auth-mfa/totp) e [proteção da Data API](https://supabase.com/docs/guides/database/hardening-data-api).
