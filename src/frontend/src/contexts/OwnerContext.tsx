import type { Principal } from "@icp-sdk/core/principal";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

// Hardcoded owner principal IDs
export const OWNER_PRINCIPAL_IDS = [
  "z3mva-tptde-7oekh-xfili-hlllb-ljasq-t5z65-b3z44-sc4qp-j6qxy-rqe",
  "z3mva-tptde-7oekh-xfili-hlllb-ljasq-t5z65-b3z44-sc4qp-j",
];

interface OwnerContextValue {
  ownerPrincipal: Principal | null;
  isOwner: boolean;
  isLoadingOwner: boolean;
  claimOwnership: () => Promise<void>;
  refetchOwner: () => void;
}

const OwnerContext = createContext<OwnerContextValue>({
  ownerPrincipal: null,
  isOwner: false,
  isLoadingOwner: false,
  claimOwnership: async () => {},
  refetchOwner: () => {},
});

export function OwnerProvider({ children }: { children: React.ReactNode }) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [ownerPrincipal, setOwnerPrincipal] = useState<Principal | null>(null);

  // isOwner is computed directly from identity against the hardcoded list
  // No async backend call needed — avoids all timing/loading issues
  const isOwner = useMemo(() => {
    if (!identity) return false;
    const callerPrincipal = identity.getPrincipal().toString();
    return OWNER_PRINCIPAL_IDS.includes(callerPrincipal);
  }, [identity]);

  const fetchOwnerPrincipal = useCallback(async () => {
    if (!actor) return;
    try {
      const a = actor as any;
      const ownerResult = await (a.getOwner() as Promise<[Principal] | []>);
      const owner: Principal | null =
        Array.isArray(ownerResult) && ownerResult.length > 0
          ? (ownerResult[0] as Principal)
          : null;
      setOwnerPrincipal(owner);
    } catch {
      // ignore
    }
  }, [actor]);

  useEffect(() => {
    if (actor) fetchOwnerPrincipal();
  }, [actor, fetchOwnerPrincipal]);

  const claimOwnership = useCallback(async () => {
    if (!actor) throw new Error("Not authenticated");
    await (actor as any).claimOwner();
    await fetchOwnerPrincipal();
  }, [actor, fetchOwnerPrincipal]);

  return (
    <OwnerContext.Provider
      value={{
        ownerPrincipal,
        isOwner,
        isLoadingOwner: false,
        claimOwnership,
        refetchOwner: fetchOwnerPrincipal,
      }}
    >
      {children}
    </OwnerContext.Provider>
  );
}

export function useOwner() {
  return useContext(OwnerContext);
}

export function isOwnerPrincipal(
  ownerPrincipal: Principal | null,
  principal: { toString(): string } | null | undefined,
): boolean {
  if (!principal) return false;
  // Check hardcoded list first
  if (OWNER_PRINCIPAL_IDS.includes(principal.toString())) return true;
  // Then check fetched owner principal
  if (!ownerPrincipal) return false;
  return ownerPrincipal.toString() === principal.toString();
}
