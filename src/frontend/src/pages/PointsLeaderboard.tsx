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
import { useActor } from "@/hooks/useActor";
import type { Principal } from "@icp-sdk/core/principal";
import { useQueryClient } from "@tanstack/react-query";
import { Crown, Gift, Loader2, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { PointsEntry } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetAllPlayerPoints, useGetMyPoints } from "../hooks/useQueries";

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5"];

interface ActorWithGivePoints {
  givePoints(recipient: Principal, amount: bigint): Promise<void>;
}

function GivePointsDialog({
  recipient,
  displayName,
  myPoints,
  onSuccess,
  open,
  onOpenChange,
}: {
  recipient: PointsEntry;
  displayName: string;
  myPoints: bigint;
  onSuccess: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { actor } = useActor();
  const [amount, setAmount] = useState("1");
  const [isPending, setIsPending] = useState(false);

  const maxAmount = Number(myPoints);
  const amountNum = Number.parseInt(amount, 10);
  const isValid =
    !Number.isNaN(amountNum) && amountNum >= 1 && amountNum <= maxAmount;

  async function handleSend() {
    if (!actor || !isValid) return;
    setIsPending(true);
    try {
      await (actor as unknown as ActorWithGivePoints).givePoints(
        recipient.player,
        BigInt(amountNum),
      );
      toast.success(`Sent ${amountNum} pts to ${displayName}!`);
      onOpenChange(false);
      setAmount("1");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to send points");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm" data-ocid="give_points.dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Give Points
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
              {myPoints.toString()} pts
            </span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="give-points-amount">Amount</Label>
            <Input
              id="give-points-amount"
              type="number"
              min={1}
              max={maxAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              data-ocid="give_points.input"
            />
            {!isValid && amount !== "" && (
              <p
                className="text-xs text-destructive"
                data-ocid="give_points.error_state"
              >
                Enter a value between 1 and {maxAmount}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            data-ocid="give_points.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!isValid || isPending}
            data-ocid="give_points.submit_button"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Gift className="mr-2 h-4 w-4" />
                Send Points
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PointsLeaderboard() {
  const { identity } = useInternetIdentity();
  const { data: entries, isLoading } = useGetAllPlayerPoints();
  const { data: myPoints = 0n } = useGetMyPoints();
  const qc = useQueryClient();

  const [giveTarget, setGiveTarget] = useState<PointsEntry | null>(null);

  const myPrincipal = identity?.getPrincipal().toString();

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
              const displayName = `${principal.slice(0, 8)}...${principal.slice(-5)}`;

              return (
                <motion.div
                  key={principal}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-4 px-5 py-4 ${
                    rank === 1 ? "bg-yellow-400/5" : ""
                  } ${isMe ? "bg-primary/10" : ""}`}
                  data-ocid={`leaderboard.item.${rank}`}
                >
                  {/* Rank */}
                  <div
                    className={`w-9 h-9 flex items-center justify-center font-bold text-lg shrink-0 ${rankColor(rank)}`}
                  >
                    {rank === 1 ? <Crown className="w-6 h-6" /> : rank}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {displayName}
                      </span>
                      {rank === 1 && (
                        <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/40 text-xs">
                          {"\uD83D\uDC51"} #1
                        </Badge>
                      )}
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
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="font-bold text-lg">
                      {entry.points.toString()}
                    </span>
                    <span className="text-xs text-muted-foreground">pts</span>
                  </div>

                  {/* Give Points button — only for other logged-in users */}
                  {myPrincipal && !isMe && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
                      onClick={() => setGiveTarget(entry)}
                      data-ocid={`leaderboard.give_points.button.${rank}`}
                    >
                      <Gift className="w-3.5 h-3.5 mr-1" />
                      Give
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Give Points Dialog */}
      {giveTarget && (
        <GivePointsDialog
          recipient={giveTarget}
          displayName={giveTargetDisplay}
          myPoints={myPoints}
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
