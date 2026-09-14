import { n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { r as getSessionContext } from "./session-Y8nXp4Kx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-session-context-DSc0c_-p.js
function useSessionContext() {
	return useQuery({
		queryKey: ["session-context"],
		queryFn: () => getSessionContext(),
		staleTime: 2e4
	});
}
//#endregion
export { useSessionContext as t };
