# Padrão de acesso biométrico do Grupo SV

Determinação expressa do titular em 23/10/2026: chaves de acesso devem integrar a gestão de todos os sites das marcas do Grupo SV, inclusive projetos futuros. Marcas: Grupo SV/PSC, SAUVID Assessoria, VIDSAU, VONCETS, MINDMORPHIA e RAREMINDSET/Mentalidade Rara.

## Comportamento obrigatório

- Usar WebAuthn/FIDO2, verificação de usuário obrigatória no cadastro e na entrada, credenciais detectáveis e bibliotecas mantidas.
- Oferecer “Entrar com digital” e “Digital e segurança”, cadastro somente após autenticação recente, nomes por aparelho, lista das próprias chaves, revogação e encerramento de sessões.
- Aceitar a escolha do autenticador pelo titular: Windows Hello, gerenciador compatível no smartphone ou criação em outro dispositivo. Evitar restringir obrigatoriamente a criação ao autenticador local.
- Validar no servidor origem HTTPS autorizada, RP ID do próprio domínio, assinatura, desafio de uso único e curto, identidade ativa e permissões atuais. Proteger com limite de tentativas, cookies seguros, proteção de origem/CSRF e auditoria.
- Preservar contas, senhas, OAuth, recuperação e autorizações existentes. Chaves não concedem novas permissões.
- Nunca receber digital, rosto, PIN ou chave privada. O dispositivo pode oferecer digital, rosto ou PIN; o site não pode impor que todo aparelho possua leitor biométrico.
- Uma chave é vinculada ao site. A digital da PSC não habilita as outras marcas. O QR code de entrada busca uma chave existente; o QR code de criação serve para cadastrar uma chave.
- Orientar cadastro no notebook e no smartphone. Chaves locais do Windows Hello ficam naquele computador. Uso em outros aparelhos depende de cadastro, sincronização compatível ou autenticação entre dispositivos.
- No erro “Nenhuma chave disponível”, indicar entrada pelo método original e cadastro em Digital e segurança, sem apagar chaves existentes nem abrir cadastro anônimo.
- Testar criptografia válida e inválida, origem/RP, ausência de verificação do usuário, desafio expirado/reutilizado, conta suspensa, chave alheia, revogação, sessões e preservação das permissões. Testar também interface desktop/mobile.
- Distinguir código implementado, publicação, chave realmente cadastrada e entrada biométrica realmente testada. Somente o titular confirma pessoalmente o cadastro e uso de credenciais reais; nunca pedir senha/PIN/código no chat nem automatizar a confirmação do aparelho.

O padrão integra o escopo permanente dos sites das marcas e não depende de nova solicitação a cada projeto. Mudanças de domínio exigem avaliar as chaves existentes e eventual novo cadastro, sem prometer migração automática entre domínios.
