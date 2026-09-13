# APIs (server functions)

Todas exigem sessão, salvo o landing. Chamadas vêm do mesmo origin.

## Sessão e empresa

- `getSessionContext` GET
- `createCompany` POST `{ name, segment, approxCustomers, currency, seedDemo }`
- `completeOnboarding` POST
- `inviteMember` POST `{ email, role }`

## Dinheiro perdido

- `getLostMoney` GET
- `createRecoveryCampaign` POST `{ name, category, message, channel, itemIds }`
- `dispatchCampaign` POST `{ campaignId }`

## CRM / funil / vendas

- `listCustomers` / `getCustomer` / `upsertCustomer` / `addCustomerNote`
- `listLeads` / `upsertLead`
- `getPipeline` / `moveDeal` / `upsertDeal`
- `listQuotes` / `createQuote` / `updateQuoteStatus`
- `listProducts` / `upsertProduct` / `adjustInventory`

## Financeiro e operação

- `getDashboard` / `getFinanceOverview` / `addTransaction`
- `listCampaigns` / `getCampaign`
- `listAppointments` / `createAppointment`
- `listLoyalty` / `listAutomations` / `toggleAutomation`
- `getTeam` / `listAudit` / `getBilling` / `changePlan`
- `runAi` POST `{ kind }`
- `probeTenantIsolation` POST
- `platformOverview` / `setCompanyStatus` (somente platform admin)

IDs de outra empresa não vazam: o `WHERE` inclui `company_id` da membership.
