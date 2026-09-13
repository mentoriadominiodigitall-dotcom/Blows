# Segurança

## Princípios

- Nunca confiar no cliente (IDs, `company_id`, papéis, plano).
- Autorização em toda server function via `authMiddleware` + `requireTenant` + `assertPermission`.
- Erros públicos sem stack trace (`AppError`).
- Segredos só em variáveis de ambiente de servidor. Nada de `VITE_` para chaves.

## Isolamento

Empresa A não lê clientes da empresa B mesmo que o ID seja chutado. O teste explícito está em Configurações → “Rodar teste de isolamento” (`probeTenantIsolation`) e em `src/lib/security/isolation.test.ts`.

RLS: políticas `tenant_select` usam `app_current_company_id()`. No preview a conexão é owner (RLS não é FORCED). Em produção, conectar com role restrito e `SET LOCAL app.company_id` dentro da transação.

## Superadmin

`profiles.is_platform_admin`. Só é ligado se o e-mail estiver em `PLATFORM_ADMIN_EMAILS`. O painel `/plataforma` recusa os demais. Dados de clientes de outras empresas não são abertos no painel — só metadados de conta, plano e status.

## Sessão

Better Auth: cookies `__Host-` em deploy, bearer no preview. `authMiddleware` rejeita request cross-site. Senhas só no Better Auth, nunca em tabela própria.

## Auditoria

`audit_logs` e `security_events`. Usuário comum não tem delete. Alteração de limite de crédito, convites, plano, automações e uso de IA são registrados.

## Variáveis (nunca em arquivo .env neste sandbox)

| Nome | Uso |
|---|---|
| `DATABASE_URL` | Neon (produção). Ausente → PGLite |
| `XAI_API_KEY` | IA |
| `STRIPE_SECRET_KEY` | Checkout |
| `STRIPE_WEBHOOK_SECRET` | Webhook de assinatura |
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp Cloud API |
| `WHATSAPP_PHONE_NUMBER_ID` | Número de envio |
| `PLATFORM_ADMIN_EMAILS` | Lista CSV de operadores da plataforma |

Plataforma injeta `DATABASE_URL` e credenciais de auth no deploy. Preview não precisa de env.
