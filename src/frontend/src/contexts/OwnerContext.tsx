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
      const [owner, callerIsOwner] = await Promise.all([
        a.getOwner() as Promise<Principal | null>,
        identity
          ? (a.isCallerOwner() as Promise<boolean>)
          : Promise.resolve(false),
      ]);
      setOwnerPrincipal(owner);
      setIsOwner(callerIsOwner);
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
    await (actor as any).claimOwnership();
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
  if (!ownerPrincipal || !principal) return false;
  return ownerPrincipal.toString() === principal.toString();
}
