import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface BanContextValue {
  isBanned: boolean;
  isLoadingBan: boolean;
  refetchBanStatus: () => void;
}

const BanContext = createContext<BanContextValue>({
  isBanned: false,
  isLoadingBan: false,
  refetchBanStatus: () => {},
});

export function BanProvider({ children }: { children: React.ReactNode }) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [isBanned, setIsBanned] = useState(false);
  const [isLoadingBan, setIsLoadingBan] = useState(false);

  const fetchBanStatus = useCallback(async () => {
    if (!actor || !identity) {
      setIsBanned(false);
      return;
    }
    setIsLoadingBan(true);
    try {
      const banned = (await (actor as any).isCallerBanned()) as boolean;
      setIsBanned(banned);
    } catch {
      setIsBanned(false);
    } finally {
      setIsLoadingBan(false);
    }
  }, [actor, identity]);

  useEffect(() => {
    fetchBanStatus();
  }, [fetchBanStatus]);

  return (
    <BanContext.Provider
      value={{
        isBanned,
        isLoadingBan,
        refetchBanStatus: fetchBanStatus,
      }}
    >
      {children}
    </BanContext.Provider>
  );
}

export function useBanStatus() {
  return useContext(BanContext);
}
