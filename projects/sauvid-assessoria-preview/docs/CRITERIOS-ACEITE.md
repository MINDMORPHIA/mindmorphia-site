# Critérios de aceite — portal SAUVID de produção

A publicação definitiva só deve ocorrer quando todos os itens abaixo estiverem testados.

## Cliente

- [ ] usuário A não acessa dados do usuário B;
- [ ] CPF não funciona como senha;
- [ ] recuperação de acesso não revela se determinado CPF possui cadastro;
- [ ] sessão expira e pode ser revogada;
- [ ] página exibe etapa, última conferência e próxima ação;
- [ ] status de cada órgão é independente;
- [ ] histórico do cliente não inclui notas internas;
- [ ] arquivos de cliente exigem autorização server-side.

## Administração

- [ ] busca exige permissão;
- [ ] mudança de status gera histórico;
- [ ] rascunho não aparece para o cliente;
- [ ] publicação registra autor/data;
- [ ] correção não apaga o evento anterior;
- [ ] permissão de operador é diferente da de administrador;
- [ ] log de auditoria não pode ser alterado pelo usuário de runtime.

## Segurança

- [ ] segredos somente em variáveis/cofre;
- [ ] nenhum dado pessoal em GitHub;
- [ ] nenhum dado sensível em query string;
- [ ] cookies Secure + HttpOnly + SameSite;
- [ ] proteção CSRF em ações autenticadas mutáveis;
- [ ] rate limiting em login/recuperação/formulário;
- [ ] headers de segurança revisados;
- [ ] upload limita tipo/tamanho e calcula hash;
- [ ] backup e restauração testados.

## Publicação

- [ ] domínio validado;
- [ ] políticas finais publicadas;
- [ ] formulário entregue no canal real;
- [ ] `noindex` removido somente na produção;
- [ ] canonical, sitemap e Open Graph finalizados;
- [ ] testes desktop/mobile/intermediário;
- [ ] smoke test após deploy;
- [ ] rollback conhecido e testável.
