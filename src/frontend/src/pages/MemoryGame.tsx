import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Brain, RefreshCw, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BannedBanner } from "../components/BannedBanner";
import { useBanStatus } from "../contexts/BanContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAwardPoints, useGetMyPoints } from "../hooks/useQueries";

const EMOJIS = ["🦊", "🐬", "🦁", "🐙", "🦋", "🐸", "🦄", "🐺"];

type CardState = {
  id: number;
  emoji: string;
  pairIndex: number;
  isFlipped: boolean;
  isMatched: boolean;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function initCards(): CardState[] {
  const pairs = EMOJIS.flatMap((emoji, idx) => [
    { emoji, pairIndex: idx },
    { emoji, pairIndex: idx },
  ]);
  return shuffle(pairs).map((p, id) => ({
    id,
    ...p,
    isFlipped: false,
    isMatched: false,
  }));
}

export default function MemoryGame() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { isBanned } = useBanStatus();
  const { data: myPoints, refetch: refetchPoints } = useGetMyPoints();
  const { mutateAsync: awardPoints } = useAwardPoints();

  const [cards, setCards] = useState<CardState[]>(initCards);
  const [selected, setSelected] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const processingRef = useRef(false);

  const matchedCount = cards.filter((c) => c.isMatched).length;

  useEffect(() => {
    if (matchedCount === cards.length && cards.length > 0) {
      setGameOver(true);
    }
  }, [matchedCount, cards.length]);

  const handleCardClick = useCallback(
    async (id: number) => {
      if (!identity || locked || processingRef.current || isBanned) return;
      const card = cards.find((c) => c.id === id);
      if (!card || card.isFlipped || card.isMatched) return;
      if (selected.includes(id)) return;

      const newSelected = [...selected, id];
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c)),
      );

      if (newSelected.length < 2) {
        setSelected(newSelected);
        return;
      }

      setLocked(true);
      processingRef.current = true;
      setSelected([]);

      const [idA, idB] = newSelected;
      const cardA = cards.find((c) => c.id === idA)!;
      const cardB = cards.find((c) => c.id === idB)!;

      // Show both flipped
      setCards((prev) =>
        prev.map((c) => (c.id === idB ? { ...c, isFlipped: true } : c)),
      );

      await new Promise((r) => setTimeout(r, 900));

      if (cardA.pairIndex === cardB.pairIndex) {
        // Match!
        setCards((prev) =>
          prev.map((c) =>
            c.id === idA || c.id === idB ? { ...c, isMatched: true } : c,
          ),
        );
        setPointsEarned((p) => p + 10);
        try {
          await awardPoints(10n);
          await refetchPoints();
        } catch {
          toast.error("Failed to award points");
        }
        toast.success("+10 points! 🎉");
      } else {
        // No match
        setCards((prev) =>
          prev.map((c) =>
            c.id === idA || c.id === idB ? { ...c, isFlipped: false } : c,
          ),
        );
      }

      setLocked(false);
      processingRef.current = false;
    },
    [identity, locked, selected, cards, awardPoints, refetchPoints, isBanned],
  );

  const resetGame = () => {
    setCards(initCards());
    setSelected([]);
    setLocked(false);
    setPointsEarned(0);
    setGameOver(false);
    processingRef.current = false;
  };

  if (isBanned) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md">
        <BannedBanner />
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <Brain className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Login to Play</h2>
        <p className="text-muted-foreground mb-6">
          You need to be logged in to earn points.
        </p>
        <Button
          className="gradient-bg border-0 text-white rounded-full px-8 glow-cyan"
          onClick={login}
          disabled={loginStatus === "logging-in"}
          data-ocid="memory.primary_button"
        >
          {loginStatus === "logging-in" ? "Connecting..." : "Log In"}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Memory Match</h1>
          <p className="text-sm text-muted-foreground">
            Find all 8 pairs to complete!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card rounded-xl px-4 py-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="font-bold">{myPoints?.toString() ?? "0"}</span>
            <span className="text-xs text-muted-foreground">pts</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetGame}
            className="gap-1"
            data-ocid="memory.secondary_button"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="glass-card rounded-xl p-3 mb-5 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Pairs found</span>
        <span className="font-semibold">{matchedCount / 2} / 8</span>
        <span className="text-sm text-muted-foreground">
          Points earned this game:{" "}
          <strong className="text-primary">{pointsEarned}</strong>
        </span>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-4 gap-3" data-ocid="memory.card.panel">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            className="aspect-square cursor-pointer"
            style={{ perspective: 600 }}
            onClick={() => handleCardClick(card.id)}
            data-ocid={`memory.item.${card.id + 1}`}
          >
            <motion.div
              className="w-full h-full relative"
              animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
              transition={{ duration: 0.35 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Back */}
              <div
                className="absolute inset-0 rounded-xl gradient-bg flex items-center justify-center text-white text-2xl font-bold glow-cyan"
                style={{ backfaceVisibility: "hidden" }}
              >
                ?
              </div>
              {/* Front */}
              <div
                className={`absolute inset-0 rounded-xl flex items-center justify-center text-3xl ${
                  card.isMatched
                    ? "bg-green-500/30 border-2 border-green-400"
                    : "glass-card"
                }`}
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                {card.emoji}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Game Over overlay */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            data-ocid="memory.modal"
          >
            <motion.div
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card rounded-3xl p-8 text-center max-w-sm mx-4"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold gradient-text mb-2">
                Game Complete!
              </h2>
              <p className="text-muted-foreground mb-4">
                You matched all 8 pairs!
              </p>
              <div className="glass-card rounded-xl p-4 mb-6">
                <p className="text-sm text-muted-foreground">Points earned</p>
                <p className="text-4xl font-bold text-primary">
                  +{pointsEarned}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1 gradient-bg border-0 text-white rounded-full glow-cyan"
                  onClick={resetGame}
                  data-ocid="memory.confirm_button"
                >
                  Play Again
                </Button>
                <Link to="/games" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full rounded-full"
                    data-ocid="memory.cancel_button"
                  >
                    Back to Games
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
