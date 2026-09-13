import { useQuery } from "@tanstack/react-query";
import { getSessionContext } from "@/lib/server/session";

export function useSessionContext() {
  return useQuery({
    queryKey: ["session-context"],
    queryFn: () => getSessionContext(),
    staleTime: 20_000,
  });
}
