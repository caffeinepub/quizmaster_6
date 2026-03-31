import { RankBadge } from "@/components/RankBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useActor } from "@/hooks/useActor";
import type { Principal } from "@icp-sdk/core/principal";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Clock,
  Crown,
  Gift,
  Loader2,
  MessageSquare,
  Trophy,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { PointsEntry } from "../backend.d";
import { isOwnerPrincipal, useOwner } from "../contexts/OwnerContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetAllAssignedRanks,
  useGetAllPlayerPoints,
  useGetMyPoints,
} from "../hooks/useQueries";

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5"];
const TROLL_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

function useTrollCooldown(myPrincipal: string, targetPrincipal: string) {
  const key = `troll_${myPrincipal}_${targetPrincipal}`;
  const [cooldownMs, setCooldownMs] = useState(() => {
    if (!myPrincipal || !targetPrincipal) return 0;
    const stored = localStorage.getItem(key);
    if (!stored) return 0;
    const remaining = TROLL_COOLDOWN_MS - (Date.now() - Number(stored));
    return remaining > 0 ? remaining : 0;
  });

  useEffect(() => {
    if (cooldownMs <= 0) return;
    const id = setInterval(() => {
      setCooldownMs((prev) => {
        const next = prev - 1000;
        if (next <= 0) {
          clearInterval(id);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [cooldownMs]);

  function startCooldown() {
    localStorage.setItem(key, Date.now().toString());
    setCooldownMs(TROLL_COOLDOWN_MS);
  }

  return { cooldownMs, startCooldown };
}

function GiftPointsDialog({
  recipient,
  displayName,
  myPoints,
  isCallerOwner,
  onSuccess,
  open,
  onOpenChange,
}: {
  recipient: PointsEntry;
  displayName: string;
  myPoints: bigint;
  isCallerOwner: boolean;
  onSuccess: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { actor } = useActor();
  const [amount, setAmount] = useState("1");
  const [isPending, setIsPending] = useState(false);

  const maxAmount = isCallerOwner ? Number.MAX_SAFE_INTEGER : Number(myPoints);
  const amountNum = Number.parseInt(amount, 10);
  const isValid =
    !Number.isNaN(amountNum) &&
    amountNum >= 1 &&
    (isCallerOwner || amountNum <= maxAmount);

  async function handleSend() {
    if (!actor || !isValid) return;
    setIsPending(true);
    try {
      await actor.giftPoints(recipient.player, BigInt(amountNum));
      toast.success(`Gifted ${amountNum} pts to ${displayName}!`);
      onOpenChange(false);
      setAmount("1");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to gift points");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm" data-ocid="gift_points.dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Gift Points
          </DialogTitle>
          <DialogDescription>
            Send points to{" "}
            <span className="font-semibold text-foreground">{displayName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your balance</span>
            <span className="flex items-center gap-1 font-bold">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              {isCallerOwner ? "∞" : myPoints.toString()} pts
            </span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gift-points-amount">Amount</Label>
            <Input
              id="gift-points-amount"
              type="number"
              min={1}
              max={isCallerOwner ? undefined : maxAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              data-ocid="gift_points.input"
            />
            {!isValid && amount !== "" && (
              <p
                className="text-xs text-destructive"
                data-ocid="gift_points.error_state"
              >
                {isCallerOwner
                  ? "Enter a value greater than 0"
                  : `Enter a value between 1 and ${maxAmount}`}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            data-ocid="gift_points.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!isValid || isPending}
            data-ocid="gift_points.submit_button"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Gift className="mr-2 h-4 w-4" />
                Gift Points
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface TrollButtonProps {
  myPrincipal: string;
  targetPrincipal: string;
  targetDisplayName: string;
  rank: number;
}

function TrollButton({
  myPrincipal,
  targetPrincipal,
  targetDisplayName,
  rank,
}: TrollButtonProps) {
  const { actor } = useActor();
  const { cooldownMs, startCooldown } = useTrollCooldown(
    myPrincipal,
    targetPrincipal,
  );
  const [trolling, setTrolling] = useState(false);

  async function handleTroll() {
    if (!actor || cooldownMs > 0 || trolling) return;
    const pts = Math.floor(Math.random() * 41) + 10; // 10–50
    setTrolling(true);
    try {
      await actor.awardPoints(BigInt(pts));
      startCooldown();
      toast.success(
        `😈 You trolled ${targetDisplayName} and stole ${pts} points!`,
      );
    } catch {
      toast.error("Troll failed. Try again.");
    } finally {
      setTrolling(false);
    }
  }

  if (cooldownMs > 0) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              disabled
              className="text-muted-foreground opacity-50"
              data-ocid={`leaderboard.troll.button.${rank}`}
            >
              <Clock className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>On cooldown</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleTroll}
      disabled={trolling}
      className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
      title={`Troll ${targetDisplayName}`}
      data-ocid={`leaderboard.troll.button.${rank}`}
    >
      😈
    </Button>
  );
}

export default function PointsLeaderboard() {
  const { identity } = useInternetIdentity();
  const { data: entries, isLoading } = useGetAllPlayerPoints();
  const { data: myPoints = 0n } = useGetMyPoints();
  const { ownerPrincipal, isOwner } = useOwner();
  const { data: assignedRanks } = useGetAllAssignedRanks();

  const assignedRankMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of assignedRanks ?? []) {
      if (e.rank) map.set(e.player.toString(), e.rank);
    }
    return map;
  }, [assignedRanks]);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [giveTarget, setGiveTarget] = useState<PointsEntry | null>(null);

  const myPrincipal = identity?.getPrincipal().toString() ?? "";

  const sorted = entries
    ? [...entries].sort((a, b) =>
        b.points > a.points ? 1 : b.points < a.points ? -1 : 0,
      )
    : [];

  const rankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-slate-300";
    if (rank === 3) return "text-amber-600";
    return "text-muted-foreground";
  };

  function refreshPoints() {
    qc.invalidateQueries({ queryKey: ["allPlayerPoints"] });
    qc.invalidateQueries({ queryKey: ["myPoints"] });
  }

  const giveTargetDisplay = giveTarget
    ? `${giveTarget.player.toString().slice(0, 8)}...${giveTarget.player.toString().slice(-5)}`
    : "";

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 mb-2">
          <Trophy className="w-7 h-7 text-yellow-400" />
          <h1 className="text-3xl font-bold gradient-text">
            Points Leaderboard
          </h1>
        </div>
        <p className="text-muted-foreground">
          All-time top players ranked by mini-game points
        </p>
      </motion.div>

      <div
        className="glass-card rounded-2xl overflow-hidden"
        data-ocid="leaderboard.table"
      >
        {isLoading ? (
          <div className="p-6 space-y-3" data-ocid="leaderboard.loading_state">
            {SKELETON_KEYS.map((k) => (
              <Skeleton key={k} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-12 text-center" data-ocid="leaderboard.empty_state">
            <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No players yet. Be the first to earn points!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {sorted.map((entry, i) => {
              const rank = i + 1;
              const principal = entry.player.toString();
              const isMe = myPrincipal && principal === myPrincipal;
              const isEntryOwner = isOwnerPrincipal(
                ownerPrincipal,
                entry.player,
              );
              const displayName = `${principal.slice(0, 8)}...${principal.slice(-5)}`;
              const entryPoints = Number(entry.points);
              const displayPoints = isEntryOwner
                ? "∞"
                : entry.points.toString();
              const vipKey = `vip_${principal}`;
              const entryIsVip =
                typeof window !== "undefined" && !!localStorage.getItem(vipKey);

              return (
                <motion.div
                  key={principal}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-4 px-5 py-4 ${
                    rank === 1 && !isEntryOwner ? "bg-yellow-400/5" : ""
                  } ${isMe ? "bg-primary/10" : ""}`}
                  data-ocid={`leaderboard.item.${rank}`}
                >
                  {/* Rank */}
                  <div
                    className={`w-9 h-9 flex items-center justify-center font-bold text-lg shrink-0 ${rankColor(rank)}`}
                  >
                    {isEntryOwner ? (
                      <span title="Owner">👑</span>
                    ) : rank === 1 ? (
                      <Crown className="w-6 h-6" />
                    ) : (
                      rank
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">
                        {displayName}
                      </span>
                      <RankBadge
                        points={entryPoints}
                        isOwner={isEntryOwner}
                        assignedRank={assignedRankMap.get(principal)}
                        isVip={entryIsVip}
                      />
                      {isMe && (
                        <Badge
                          variant="outline"
                          className="border-primary/60 text-primary text-xs"
                        >
                          You
                        </Badge>
                      )}
                      {!isEntryOwner && rank === 1 && (
                        <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/40 text-xs">
                          🏆 #1
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Points */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="font-bold text-lg">{displayPoints}</span>
                    <span className="text-xs text-muted-foreground">pts</span>
                  </div>

                  {/* Action buttons */}
                  {myPrincipal && !isMe && (
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Message button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          navigate({
                            to: "/messages/$userId",
                            params: { userId: principal },
                          })
                        }
                        data-ocid={`leaderboard.message.button.${rank}`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </Button>

                      {/* Gift Points button */}
                      {(isOwner || myPoints > 0n) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
                          onClick={() => setGiveTarget(entry)}
                          data-ocid={`leaderboard.give_points.button.${rank}`}
                        >
                          <Gift className="w-3.5 h-3.5 mr-1" />
                          Gift
                        </Button>
                      )}

                      {/* Troll button — not shown for Owner principals */}
                      {!isEntryOwner && identity && (
                        <TrollButton
                          myPrincipal={myPrincipal}
                          targetPrincipal={principal}
                          targetDisplayName={displayName}
                          rank={rank}
                        />
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Gift Points Dialog */}
      {giveTarget && (
        <GiftPointsDialog
          recipient={giveTarget}
          displayName={giveTargetDisplay}
          myPoints={myPoints}
          isCallerOwner={isOwner}
          open={!!giveTarget}
          onOpenChange={(open) => {
            if (!open) setGiveTarget(null);
          }}
          onSuccess={refreshPoints}
        />
      )}
    </div>
  );
}
