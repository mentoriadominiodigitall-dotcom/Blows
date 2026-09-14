//#region node_modules/.nitro/vite/services/ssr/assets/permissions-6R54wWQh.js
var ROLE_SLUGS = [
	"owner",
	"admin",
	"manager",
	"seller",
	"finance",
	"attendant"
];
var ROLE_LABELS = {
	owner: "Proprietário",
	admin: "Administrador",
	manager: "Gerente",
	seller: "Vendedor",
	finance: "Financeiro",
	attendant: "Atendente"
};
var PERMISSIONS = [
	"customers.read",
	"customers.write",
	"leads.read",
	"leads.write",
	"deals.read",
	"deals.write",
	"quotes.read",
	"quotes.write",
	"sales.read",
	"sales.write",
	"products.read",
	"products.write",
	"finance.read",
	"finance.write",
	"campaigns.read",
	"campaigns.write",
	"automations.read",
	"automations.write",
	"team.read",
	"team.write",
	"ai.use",
	"settings.write",
	"billing.manage",
	"audit.read"
];
var DEFAULT_ROLE_PERMISSIONS = {
	owner: "*",
	admin: PERMISSIONS.filter((p) => p !== "billing.manage"),
	manager: [
		"customers.read",
		"customers.write",
		"leads.read",
		"leads.write",
		"deals.read",
		"deals.write",
		"quotes.read",
		"quotes.write",
		"sales.read",
		"products.read",
		"finance.read",
		"campaigns.read",
		"campaigns.write",
		"team.read",
		"ai.use",
		"audit.read"
	],
	seller: [
		"customers.read",
		"customers.write",
		"leads.read",
		"leads.write",
		"deals.read",
		"deals.write",
		"quotes.read",
		"quotes.write",
		"sales.read",
		"sales.write",
		"products.read",
		"ai.use"
	],
	finance: [
		"customers.read",
		"sales.read",
		"quotes.read",
		"finance.read",
		"finance.write",
		"products.read",
		"ai.use"
	],
	attendant: [
		"customers.read",
		"customers.write",
		"leads.read",
		"products.read"
	]
};
function permissionsForRole(role) {
	const listed = DEFAULT_ROLE_PERMISSIONS[role];
	if (listed === "*") return new Set(PERMISSIONS);
	return new Set(listed);
}
function hasPermission(role, permission, overrides) {
	if (role === "owner") return true;
	let allowed = permissionsForRole(role).has(permission);
	if (overrides) {
		const hit = overrides.find((o) => o.permission_slug === permission);
		if (hit) allowed = hit.allowed;
	}
	return allowed;
}
function isRoleSlug(value) {
	return ROLE_SLUGS.includes(value);
}
//#endregion
export { isRoleSlug as i, ROLE_SLUGS as n, hasPermission as r, ROLE_LABELS as t };
