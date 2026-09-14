import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-BkPx-PIH.mjs";
import { t as AppError } from "./errors-nQop9poO.mjs";
import { i as createSsrRpc } from "./router-Qcf6f3NG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ops-Dp9zSX-z.js
var listCampaigns = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("b6125d511b8b999ed4e2d6b8ddf708b9c532f70239643bf91abfd938ec78991b"));
var getCampaign = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("72e89f7827a17e0520d4586aee55e800b84ca38a1319266b60a21a8d54f4e816"));
var listAppointments = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("38aaac3a4b0ccafe4fc0390c0bea4a84d9911b6706acbfeb51bca27adb15d2aa"));
var createAppointment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const title = input.title?.trim();
	if (!title) throw new AppError("VALIDATION", "Informe o compromisso.");
	return {
		title,
		startsAt: input.startsAt,
		endsAt: input.endsAt,
		customerId: input.customerId || null
	};
}).handler(createSsrRpc("63430134a1a459660f8dabec2d55d61937178835f141a9660757debf7ec8dda7"));
var listLoyalty = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("e39835f98ee343e2d6389b829ceef2da6f60f8bb8503601864f88fbba3437997"));
var listAutomations = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("ce97f4916df89b0f41e3dcfb821cc788e839176d785d77b0e8f6fd63804aef5c"));
var toggleAutomation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("7b3a8adf5c39d507400299108d21b285e561dfd88968d73f24125829d86b6592"));
var getTeam = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("e39ec37ed6f88a235ce700d8ddcc5a464507febff938eda4ac29feafcf08ffaf"));
var listAudit = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("8d08f52a174f68a31c70995677e3291f2eb25048b32a9bd5aa9bcf558ce71cb8"));
var getBilling = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("a4335eeb07579f2ccccf5031362bbeddc8c2423de5ee3f5eb4383f14ef48b855"));
var changePlan = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("13de89879cf7de87177945887ff0361fc7aaf3e8ca5a2df46f9db3256a3a9bd7"));
var runAi = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("faced4f2a37b1676954439090ad0bd5a4fdf77df06ad2bb85d4185cd0d1ad683"));
var platformOverview = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("69e4060bc94b8fd7c758b69f647800fbf001e88fee1e7f8ff1440143c7c56333"));
var setCompanyStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("a81b2999beec96540f04dbe311c8d1c6d84727bbbadb75718e20e54ccba60aa8"));
//#endregion
export { getTeam as a, listAutomations as c, platformOverview as d, runAi as f, getCampaign as i, listCampaigns as l, toggleAutomation as m, createAppointment as n, listAppointments as o, setCompanyStatus as p, getBilling as r, listAudit as s, changePlan as t, listLoyalty as u };
