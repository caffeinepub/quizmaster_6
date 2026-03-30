import type { Principal } from "@icp-sdk/core/principal";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

// Hardcoded owner principal IDs
const OWNER_PRINCIPAL_IDS = [
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
  isLoadingOwner: true,
  claimOwnership: async () => {},
  refetchOwner: () => {},
});

export function OwnerProvider({ children }: { children: React.ReactNode }) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const [ownerPrincipal, setOwnerPrincipal] = useState<Principal | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoadingOwner, setIsLoadingOwner] = useState(true);

  const fetchOwner = useCallback(async () => {
    if (!actor) return;
    setIsLoadingOwner(true);
    try {
      const a = actor as any;
      // getOwner returns ?Principal which is [Principal] | [] in JS
      const ownerResult = await (a.getOwner() as Promise<[Principal] | []>);
      const owner: Principal | null =
        Array.isArray(ownerResult) && ownerResult.length > 0
          ? (ownerResult[0] as Principal)
          : null;
      setOwnerPrincipal(owner);

      // Check if caller is owner: first check hardcoded list, then backend
      if (identity) {
        const callerPrincipal = identity.getPrincipal().toString();
        const isHardcodedOwner = OWNER_PRINCIPAL_IDS.includes(callerPrincipal);
        if (isHardcodedOwner) {
          setIsOwner(true);
        } else {
          try {
            const callerIsOwner = await (a.isCallerOwner() as Promise<boolean>);
            setIsOwner(callerIsOwner);
          } catch {
            setIsOwner(false);
          }
        }
      } else {
        setIsOwner(false);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingOwner(false);
    }
  }, [actor, identity]);

  useEffect(() => {
    if (actor && !isFetching) {
      fetchOwner();
    }
  }, [actor, isFetching, fetchOwner]);

  const claimOwnership = useCallback(async () => {
    if (!actor) throw new Error("Not authenticated");
    await (actor as any).claimOwner();
    await fetchOwner();
  }, [actor, fetchOwner]);

  return (
    <OwnerContext.Provider
      value={{
        ownerPrincipal,
        isOwner,
        isLoadingOwner,
        claimOwnership,
        refetchOwner: fetchOwner,
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
