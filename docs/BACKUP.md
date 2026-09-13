# Backup e recuperação

## Produção (Neon)

1. Habilitar PITR (point-in-time recovery) no projeto Neon.
2. Snapshot diário automático (plataforma Neon).
3. Antes de migração destrutiva: `pg_dump` lógico para object storage.

Restauração:

```
# dump lógico
pg_dump "$DATABASE_URL" --no-owner --format=custom -f reviva.dump

# restore em database novo
pg_restore --clean --if-exists -d "$NEW_DATABASE_URL" reviva.dump
```

Depois: conferir `_migrations`, Better Auth (`user`, `session`) e `companies`.

## Preview / PGLite

O banco do preview é in-memory e some no restart. Não é ambiente de produção. Dados de demonstração podem ser gerados de novo no onboarding.

## Disaster recovery

RPO alvo: 24h (snapshot diário) / minutos com PITR.
RTO alvo: recriar o app + apontar `DATABASE_URL` + `npm run db:migrate` (idempotente).

Logs de auditoria devem ir para o mesmo dump. Sem eles, o rastro financeiro se perde.

## Histórico de schema

Arquivos em `migrations/` são imutáveis depois de aplicados. Correções entram em `0006_*.sql` em diante.
