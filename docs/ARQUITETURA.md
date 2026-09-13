# REVIVA — arquitetura

SaaS multi-tenant para recuperar receita parada. O ciclo do produto é:

**identificar dinheiro perdido → escolher a oportunidade → executar a recuperação → medir o resultado.**

## Stack neste ambiente

O contrato do runtime é TanStack Start + Postgres (Neon em produção, PGLite no preview) + Better Auth. Não há Next.js nem Supabase neste sandbox. A modelagem (tenant, RLS, RBAC, adapters) é a mesma que um deploy Postgres tradicional.

- UI: React 19, Tailwind v4, TanStack Router/Query
- Auth: Better Auth (Google, X, e-mail/senha) em `/api/auth/*`
- Dados: `getSql()` — Neon se `DATABASE_URL` existir, senão PGLite
- IA: adapter xAI (`XAI_API_KEY`), sem acesso direto ao banco
- Pagamentos: adapter Stripe (não cobra sem segredo)
- Mensagens: adapter WhatsApp Business (não envia sem credencial e consentimento)

## Pastas

```
migrations/          schema Postgres (0001 auth, 0002–0005 app)
src/routes/          páginas e /api/auth
src/lib/server/      server functions (autorização + SQL)
src/lib/integrations adapters externos
src/lib/permissions  RBAC
src/components/      UI
docs/                operação, segurança, backup
```

## Multi-tenant

1. Sessão autenticada → `context.userId` (middleware; nunca id do cliente)
2. `requireTenant(userId)` resolve `company_id` em `company_members`
3. Toda query inclui `company_id = tenant.companyId`
4. IDs de outra empresa retornam 404/403, nunca a linha
5. RLS existe como defesa extra para um role de aplicação não-owner

## Papéis

Proprietário, administrador, gerente, vendedor, financeiro, atendente. Permissões em `src/lib/permissions.ts` e tabelas `permissions` / `role_permissions`. Owner pode personalizar via `company_role_permissions`.

## Dinheiro perdido

Calculado em SQL a partir de dados da empresa:

- clientes sem compra no intervalo configurado (ticket médio)
- leads parados (valor estimado)
- orçamentos sent/viewed sem resposta (total)
- faturas vencidas (saldo)
- recompra atrasada (intervalo médio × multiplicador)

Não há métrica hardcoded na UI.

## Integrações

Adapters em `src/lib/integrations`. Sem credencial: a UI mostra **configuração necessária**. Nada é fingido como enviado ou pago.

## Backup

Ver [BACKUP.md](./BACKUP.md).
