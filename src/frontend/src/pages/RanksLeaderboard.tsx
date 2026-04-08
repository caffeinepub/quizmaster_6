import { RankBadge } from "@/components/RankBadge";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getRankFromAssigned } from "@/lib/ranks";
import { Medal } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { isOwnerPrincipal, useOwner } from "../contexts/OwnerContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  type PlayerRankEntry,
  useGetAllAssignedRanks,
  useGetAllPlayerPoints,
} from "../hooks/useQueries";
import type { PointsEntry } from "../types";

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5"];

const RANK_TIER: Record<string, number> = {
  Owner: 6,
  Admin: 5,
  Hacker: 4,
  God: 3,
  Pro: 2,
  Noob: 1,
};

interface MergedEntry {
  player: { toString(): string };
  points: bigint;
  isEntryOwner: boolean;
  assignedRank: string | undefined;
  rankName: string;
  tierOrder: number;
}

export default function RanksLeaderboard() {
  const { identity } = useInternetIdentity();
  const { ownerPrincipal } = useOwner();
  const { data: entries, isLoading: loadingPoints } = useGetAllPlayerPoints();
  const { data: assignedRanks, isLoading: loadingRanks } =
    useGetAllAssignedRanks();

  const isLoading = loadingPoints || loadingRanks;
  const myPrincipal = identity?.getPrincipal().toString();

  const assignedRankMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of assignedRanks ?? []) {
      if (e.rank) map.set(e.player.toString(), e.rank);
    }
    return map;
  }, [assignedRanks]);

  const sorted = useMemo(() => {
    if (!entries) return [];
    const merged: MergedEntry[] = entries.map((entry) => {
      const principal = entry.player.toString();
      const isEntryOwner = isOwnerPrincipal(ownerPrincipal, entry.player);
      const assigned = assignedRankMap.get(principal);
      const rankInfo = getRankFromAssigned(
        assigned,
        Number(entry.points),
        isEntryOwner,
      );
      return {
        player: entry.player,
        points: entry.points,
        isEntryOwner,
        assignedRank: assigned,
        rankName: rankInfo.name,
        tierOrder: RANK_TIER[rankInfo.name] ?? 1,
      };
    });

    return merged.sort((a, b) => {
      if (b.tierOrder !== a.tierOrder) return b.tierOrder - a.tierOrder;
      if (b.points > a.points) return 1;
      if (b.points < a.points) return -1;
      return 0;
    });
  }, [entries, assignedRankMap, ownerPrincipal]);

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 mb-2">
          <Medal className="w-7 h-7 text-purple-400" />
          <h1 className="text-3xl font-bold gradient-text">
            Ranks Leaderboard
          </h1>
        </div>
        <p className="text-muted-foreground">
          Players sorted by rank tier — Owner is the most powerful
        </p>
      </motion.div>

      <div
        className="glass-card rounded-2xl overflow-hidden"
        data-ocid="ranks_leaderboard.table"
      >
        {isLoading ? (
          <div
            className="p-6 space-y-3"
            data-ocid="ranks_leaderboard.loading_state"
          >
            {SKELETON_KEYS.map((k) => (
              <Skeleton key={k} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div
            className="p-12 text-center"
            data-ocid="ranks_leaderboard.empty_state"
          >
            <Medal className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No players yet. Play games and earn points to appear here!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {sorted.map((entry, i) => {
              const position = i + 1;
              const principal = entry.player.toString();
              const isMe = myPrincipal && principal === myPrincipal;
              const displayName = `${principal.slice(0, 8)}...${principal.slice(-5)}`;
              const displayPoints = entry.isEntryOwner
                ? "∞"
                : entry.points.toString();

              return (
                <motion.div
                  key={principal}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-center gap-4 px-5 py-4 ${
                    entry.isEntryOwner ? "bg-yellow-400/5" : ""
                  } ${isMe ? "bg-primary/10" : ""}`}
                  data-ocid={`ranks_leaderboard.item.${position}`}
                >
                  {/* Position */}
                  <div className="w-8 h-8 flex items-center justify-center font-bold text-base shrink-0 text-muted-foreground">
                    {entry.isEntryOwner ? (
                      <span title="Owner">👑</span>
                    ) : (
                      position
                    )}
                  </div>

                  {/* Name & Rank */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">
                        {displayName}
                      </span>
                      <RankBadge
                        points={Number(entry.points)}
                        isOwner={entry.isEntryOwner}
                        assignedRank={entry.assignedRank}
                      />
                      {isMe && (
                        <Badge
                          variant="outline"
                          className="border-primary/60 text-primary text-xs"
                        >
                          You
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Points */}
                  <div className="flex items-center gap-1 shrink-0 text-right">
                    <span className="font-bold">{displayPoints}</span>
                    <span className="text-xs text-muted-foreground">pts</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
