# 06_USER_MANAGEMENT_AUTOMATION.md

## Automação de Gerenciamento de Usuários e Permissões (Supabase)

### 1. Revisão da Estrutura de Autenticação e Autorização (Supabase)

**TODO:**
*   Mapear os diferentes perfis de usuário (ex: Fisioterapeuta, Administrador, Paciente) e suas respectivas funções e responsabilidades no sistema.
*   Revisar as políticas de Row Level Security (RLS) existentes no Supabase para cada tabela relevante, garantindo que as permissões estejam corretamente configuradas para cada perfil de usuário.
*   Documentar a estrutura completa de autenticação (como os usuários se autenticam) e autorização (o que cada perfil pode fazer).

### 2. Provisionamento Automatizado de Usuários

**TODO:**
*   Implementar um fluxo (via Server Action ou API Route) para a criação de novos usuários (ex: quando um novo fisioterapeuta é contratado ou um paciente se cadastra).
*   Integrar com o sistema de autenticação do Supabase para criar a conta do usuário de forma programática.
*   Atribuir automaticamente o perfil e as permissões iniciais corretas ao novo usuário no momento da criação.
*   Configurar o envio automático de credenciais de acesso ou link de ativação de conta para o novo usuário (ex: via e-mail ou WhatsApp).

### 3. Desprovisionamento Automatizado de Usuários

**TODO:**
*   Implementar um fluxo (via Server Action ou API Route) para a desativação ou exclusão de usuários (ex: quando um fisioterapeuta sai da clínica ou um paciente solicita a exclusão de dados).
*   Desativar a conta do usuário no Supabase Auth, impedindo novos acessos.
*   Revogar todas as permissões associadas ao usuário.
*   (Opcional) Implementar lógica para arquivar dados do usuário ou transferir a propriedade de dados para outro usuário, conforme políticas de privacidade e retenção de dados.

### 4. Revisões Periódicas de Permissões

**TODO:**
*   Criar um job de cron (Inngest) para gerar relatórios periódicos sobre as permissões atuais de todos os usuários.
*   Implementar a lógica para identificar usuários com permissões excessivas, inconsistentes ou que não seguem as políticas de segurança definidas.
*   Configurar o envio de alertas automáticos para administradores sobre permissões que precisam de revisão manual.

### 5. Auditoria de Acesso

**TODO:**
*   Implementar logging de auditoria detalhado para registrar todos os acessos e ações críticas realizadas pelos usuários no sistema (ex: login, modificação de dados de paciente, alteração de permissões).
*   Utilizar os recursos de logging do Supabase ou integrar com uma ferramenta de monitoramento (ex: Sentry) para coletar, armazenar e analisar logs de acesso de forma segura.
*   Desenvolver um mecanismo para visualizar e pesquisar esses logs de auditoria.
