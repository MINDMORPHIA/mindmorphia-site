# Digital e chaves de acesso

O administrador pode cadastrar chaves de acesso em Gestão → Digital e segurança. No notebook, use Chrome/Edge com Windows Hello. No S26 Ultra, abra a mesma URL pelo Chrome, entre com a senha e repita o cadastro. O sistema operacional oferece digital ou PIN conforme o aparelho e seu gerenciador de credenciais. A SAUVID não recebe nem armazena impressões digitais.

Cadastro e remoção exigem sessão de até dez minutos, conta administrativa ativa e confirmação pessoal da janela de segurança. Se a sessão for antiga, sair e entrar novamente com a senha. A senha e recuperação existentes são preservadas. Remover uma chave encerra todas as sessões dessa conta. A confirmação de cadastro não pode ser automatizada em produção.

Chaves vinculadas ao RP `sauvid-assessoria.vercel.app`. Uma futura troca de domínio exige novo cadastro no novo endereço. Chaves sincronizadas dependem do gerenciador do aparelho; cadastrar e testar em cada aparelho evita depender dessa sincronização.

Better Auth Passkey 1.7.7 valida desafio de uso único, origem, RP, assinatura e contador. O servidor exige `userVerified` tanto no cadastro como no login, inclusive quando um cliente altera as opções enviadas ao navegador. Contas de clientes, operadores e auditores não cadastram nem usam esse caminho. O vínculo ativo é revalidado antes de criar sessão e em cada acesso ao portal. Rotas do plugin não ficam abertas diretamente no roteador de autenticação; `/api/passkeys` restringe operações, origem, tamanho e frequência.

O migrador oficial adiciona a tabela `passkey` à identidade sem substituir cadastros. O snapshot de QA inclui a tabela. O bundle MIT SimpleWebAuthn Browser 13.3.0 fica em `vendor/`, reproduzido com `node scripts/vendor-passkeys.cjs`. Testes criptográficos e de isolamento usam somente contas e credenciais sintéticas em banco temporário. Login biométrico real exige cadastro e teste pelo responsável nos próprios aparelhos.
