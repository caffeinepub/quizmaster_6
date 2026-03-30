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
import { AlertTriangle, Loader2, ShoppingCart, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  type PointPackage,
  useFulfillPointsPurchase,
  useGetMonthlyLimit,
  useGetMyMonthlySpend,
  useGetPointPackages,
} from "../hooks/useQueries";

const MONTHLY_LIMIT_PAISE = 1_000_000n; // ₹10,000

const STATIC_PACKAGES: Array<PointPackage & { badge: string | null }> = [
  { id: 0n, name: "Starter", points: 100n, priceInPaise: 5000n, badge: null },
  {
    id: 1n,
    name: "Popular",
    points: 500n,
    priceInPaise: 10000n,
    badge: "Best Value",
  },
  {
    id: 2n,
    name: "Premium",
    points: 1000n,
    priceInPaise: 55000n,
    badge: null,
  },
  {
    id: 3n,
    name: "Mega",
    points: 10000n,
    priceInPaise: 100000n,
    badge: "Most Points",
  },
];

function formatRupees(paise: bigint): string {
  return `₹${(Number(paise) / 100).toLocaleString("en-IN")}`;
}

function formatPoints(pts: bigint): string {
  return Number(pts).toLocaleString("en-IN");
}

export default function BuyPoints() {
  const { identity, login } = useInternetIdentity();
  const { data: packages } = useGetPointPackages();
  const { data: monthlySpend = 0n, refetch: refetchSpend } =
    useGetMyMonthlySpend();
  const { data: monthlyLimit = MONTHLY_LIMIT_PAISE } = useGetMonthlyLimit();
  const fulfill = useFulfillPointsPurchase();

  const [selectedPkg, setSelectedPkg] = useState<
    (typeof STATIC_PACKAGES)[0] | null
  >(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const displayPackages: Array<PointPackage & { badge: string | null }> =
    packages && packages.length > 0
      ? packages.map((p, i) => ({
          ...p,
          badge: STATIC_PACKAGES[i]?.badge ?? null,
        }))
      : STATIC_PACKAGES;

  const spendPercent =
    monthlyLimit > 0n
      ? Math.min(100, Number((monthlySpend * 100n) / monthlyLimit))
      : 0;

  function openDialog(pkg: (typeof STATIC_PACKAGES)[0]) {
    setSelectedPkg(pkg);
    setDialogOpen(true);
  }

  async function handleConfirmPurchase() {
    if (!selectedPkg) return;
    const sessionId = `demo_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    try {
      const awarded = await fulfill.mutateAsync({
        packageId: selectedPkg.id,
        sessionId,
      });
      toast.success(
        `✅ ${formatPoints(awarded)} points added to your account!`,
      );
      setDialogOpen(false);
      refetchSpend();
    } catch (err: any) {
      toast.error(err?.message ?? "Purchase failed. Please try again.");
    }
  }

  if (!identity) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-10 text-center max-w-md w-full"
          data-ocid="buy_points.card"
        >
          <ShoppingCart className="w-14 h-14 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold gradient-text mb-2">Buy Points</h2>
          <p className="text-muted-foreground mb-6">
            Log in to purchase points and climb the leaderboard.
          </p>
          <Button
            onClick={login}
            className="gradient-bg border-0 text-white font-semibold rounded-full px-8 glow-cyan"
            data-ocid="buy_points.primary_button"
          >
            Log In to Continue
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center glow-cyan">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text">Buy Points</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Purchase points instantly to climb the leaderboard
        </p>
      </motion.div>

      {/* Demo notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-xl p-4 flex items-start gap-3 border border-yellow-500/30"
        style={{ background: "oklch(0.18 0.04 80 / 0.4)" }}
        data-ocid="buy_points.panel"
      >
        <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-200/80">
          <span className="font-semibold text-yellow-300">Demo Mode:</span>{" "}
          Payment integration requires Stripe configuration. Purchases are
          simulated and points are awarded instantly.
        </p>
      </motion.div>

      {/* Monthly spend progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card rounded-2xl p-6 space-y-3"
        data-ocid="buy_points.section"
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground font-medium">
            Monthly Spending
          </span>
          <span className="font-semibold">
            <span className="text-foreground">
              {formatRupees(monthlySpend)}
            </span>
            <span className="text-muted-foreground">
              {" "}
              of {formatRupees(monthlyLimit)}
            </span>
          </span>
        </div>
        <div
          className="w-full h-2.5 rounded-full"
          style={{ background: "oklch(0.22 0.03 250)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${spendPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full gradient-bg"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {spendPercent >= 100
            ? "Monthly limit reached. Resets next month."
            : `${formatRupees(monthlyLimit - monthlySpend)} remaining this month`}
        </p>
      </motion.div>

      {/* Package cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {displayPackages.map((pkg, i) => {
          const wouldExceed = monthlySpend + pkg.priceInPaise > monthlyLimit;
          const isPopular = pkg.badge === "Best Value";
          return (
            <motion.div
              key={pkg.id.toString()}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2 + i * 0.08,
                type: "spring",
                stiffness: 120,
              }}
              className={`glass-card rounded-2xl p-6 flex flex-col gap-4 relative ${
                isPopular
                  ? "border-primary/60 shadow-[0_0_24px_oklch(0.73_0.14_215_/_0.18)]"
                  : ""
              }`}
              data-ocid={`buy_points.item.${i + 1}`}
            >
              {pkg.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-bg text-white border-0 px-3 py-0.5 text-xs font-semibold">
                  {pkg.badge}
                </Badge>
              )}
              <div className="space-y-1">
                <h3 className="text-lg font-bold">{pkg.name}</h3>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-extrabold gradient-text">
                    {formatPoints(pkg.points)}
                  </span>
                  <span className="text-muted-foreground text-sm">pts</span>
                </div>
              </div>
              <div className="mt-auto space-y-3">
                <p className="text-3xl font-bold">
                  {formatRupees(pkg.priceInPaise)}
                </p>
                {wouldExceed ? (
                  <Button
                    disabled
                    className="w-full rounded-xl"
                    data-ocid={`buy_points.button.${i + 1}`}
                  >
                    Monthly limit reached
                  </Button>
                ) : (
                  <Button
                    onClick={() => openDialog(pkg)}
                    className="w-full gradient-bg border-0 text-white font-semibold rounded-xl glow-cyan"
                    data-ocid={`buy_points.primary_button.${i + 1}`}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Buy Now
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Confirmation dialog */}
      <AnimatePresence>
        {dialogOpen && selectedPkg && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent
              className="glass-card border-border max-w-sm"
              data-ocid="buy_points.dialog"
            >
              <DialogHeader>
                <DialogTitle className="gradient-text text-xl">
                  Confirm Purchase
                </DialogTitle>
                <DialogDescription className="text-muted-foreground pt-2 space-y-1">
                  <span className="block text-foreground font-semibold text-base">
                    {selectedPkg.name} — {formatPoints(selectedPkg.points)} pts
                  </span>
                  <span className="block">
                    Price: {formatRupees(selectedPkg.priceInPaise)}
                  </span>
                  <span className="block text-xs text-yellow-300/70 mt-2">
                    Demo mode: no real payment will be charged.
                  </span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={fulfill.isPending}
                  data-ocid="buy_points.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmPurchase}
                  disabled={fulfill.isPending}
                  className="gradient-bg border-0 text-white font-semibold glow-cyan"
                  data-ocid="buy_points.confirm_button"
                >
                  {fulfill.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Purchase (Demo)"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
