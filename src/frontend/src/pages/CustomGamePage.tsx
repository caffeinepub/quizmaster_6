import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Brain, CheckCircle, RotateCcw, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type {
  CustomGame,
  CustomTriviaQuestion,
  SpinWheelSegment,
} from "../backend.d";
import { BannedBanner } from "../components/BannedBanner";
import { useBanStatus } from "../contexts/BanContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetAllCustomGames,
  useGetMyPoints,
  usePlayCustomSpinWheel,
  usePlayCustomTrivia,
} from "../hooks/useQueries";

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

function formatCountdown(ms: number): string {
  if (ms <= 0) return "";
  const s = Math.floor(ms / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function getCooldownKey(principalStr: string, gameId: string) {
  return `custom_game_cooldown_${principalStr}_${gameId}`;
}

function getTimeRemaining(principalStr: string, gameId: string): number {
  const stored = localStorage.getItem(getCooldownKey(principalStr, gameId));
  if (!stored) return 0;
  const remaining = COOLDOWN_MS - (Date.now() - Number(stored));
  return remaining > 0 ? remaining : 0;
}

function setCooldown(principalStr: string, gameId: string) {
  localStorage.setItem(
    getCooldownKey(principalStr, gameId),
    String(Date.now()),
  );
}

const WHEEL_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#6366f1",
  "#14b8a6",
  "#f97316",
];

function drawCustomWheel(
  canvas: HTMLCanvasElement,
  segments: SpinWheelSegment[],
) {
  const ctx = canvas.getContext("2d")!;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = cx - 8;
  const segAngle = 360 / segments.length;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const startAngle = ((i * segAngle - 90) * Math.PI) / 180;
    const endAngle = (((i + 1) * segAngle - 90) * Math.PI) / 180;
    const midAngle = (startAngle + endAngle) / 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(
      cx + r * 0.65 * Math.cos(midAngle),
      cy + r * 0.65 * Math.sin(midAngle),
    );
    ctx.rotate(midAngle + Math.PI / 2);
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${segments.length > 6 ? 11 : 14}px Plus Jakarta Sans, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(seg.segmentLabel, 0, 0);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fillStyle = "#1e1b4b";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function CustomSpinWheelGame({
  game,
  principalStr,
}: {
  game: CustomGame;
  principalStr: string;
}) {
  const gameId = game.id.toString();
  const { mutateAsync: playSpinWheel, isPending } = usePlayCustomSpinWheel();
  const { data: myPoints, refetch } = useGetMyPoints();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  const segments =
    game.gameType.__kind__ === "customSpinWheel"
      ? ((game.gameType as any).customSpinWheel.segments as SpinWheelSegment[])
      : [];

  const segAngle = segments.length > 0 ? 360 / segments.length : 360;

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{
    points: bigint;
    label: string;
  } | null>(null);
  const [cooldownMs, setCooldownMs] = useState(() =>
    getTimeRemaining(principalStr, gameId),
  );

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

  useEffect(() => {
    if (canvasRef.current && segments.length > 0) {
      drawCustomWheel(canvasRef.current, segments);
    }
  }, [segments]);

  const spin = async () => {
    if (spinning || cooldownMs > 0) return;
    setResult(null);
    setSpinning(true);

    const extraSpins = 3 + Math.floor(Math.random() * 5);
    const stopDeg = Math.floor(Math.random() * 360);
    const finalRot = rotation + extraSpins * 360 + stopDeg;
    setRotation(finalRot);

    await new Promise((r) => setTimeout(r, 4500));

    try {
      const pointsWon = await playSpinWheel(game.id);
      setCooldown(principalStr, gameId);
      setCooldownMs(COOLDOWN_MS);
      await refetch();

      const normalised = ((finalRot % 360) + 360) % 360;
      const pointerAngle = (360 - normalised + 90) % 360;
      const segIndex = Math.floor(pointerAngle / segAngle) % segments.length;
      const label = segments[segIndex]?.segmentLabel ?? `${pointsWon} pts`;
      setResult({ points: pointsWon, label });
      toast.success(`+${pointsWon} points! \uD83C\uDF89`);
    } catch {
      toast.error("Failed to award points");
    }
    setSpinning(false);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="glass-card rounded-xl px-4 py-2 flex items-center gap-2">
        <Zap className="w-4 h-4 text-yellow-400" />
        <span className="font-bold">{myPoints?.toString() ?? "0"}</span>
        <span className="text-xs text-muted-foreground">pts</span>
      </div>

      {cooldownMs > 0 ? (
        <div className="glass-card rounded-2xl px-8 py-6 text-center">
          <p className="text-muted-foreground mb-2">Come back tomorrow!</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Next play in
          </p>
          <p className="text-2xl font-bold text-primary tabular-nums">
            {formatCountdown(cooldownMs)}
          </p>
        </div>
      ) : (
        <>
          <div className="relative">
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10"
              style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
            >
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: "10px solid transparent",
                  borderRight: "10px solid transparent",
                  borderTop: "24px solid #fbbf24",
                }}
              />
            </div>
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              className="rounded-full"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning
                  ? "transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                  : "none",
                boxShadow: "0 0 40px oklch(0.73 0.14 215 / 0.4)",
              }}
              data-ocid="games.canvas_target"
            />
          </div>

          <Button
            className="w-40 h-14 text-lg font-bold gradient-bg border-0 text-white rounded-full glow-cyan disabled:opacity-50"
            onClick={spin}
            disabled={spinning || isPending}
            data-ocid="games.primary_button"
          >
            {spinning ? (
              <RotateCcw className="w-5 h-5 animate-spin" />
            ) : (
              "SPIN!"
            )}
          </Button>
        </>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        onClick={() => navigate({ to: "/games" })}
        data-ocid="games.secondary_button"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Games
      </Button>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setResult(null)}
            data-ocid="games.modal"
          >
            <motion.div
              initial={{ scale: 0.6, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-card rounded-3xl p-8 text-center max-w-xs mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-6xl mb-3">🎰</div>
              <h2 className="text-2xl font-bold gradient-text mb-1">
                You won!
              </h2>
              <div className="my-4">
                <span className="text-5xl font-bold text-primary">
                  +{result.points.toString()}
                </span>
                <span className="text-xl text-muted-foreground ml-2">pts</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {result.label}
              </p>
              <Button
                className="w-full gradient-bg border-0 text-white rounded-full glow-cyan"
                onClick={() => setResult(null)}
                data-ocid="games.close_button"
              >
                Awesome!
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CustomTriviaGame({
  game,
  principalStr,
}: {
  game: CustomGame;
  principalStr: string;
}) {
  const gameId = game.id.toString();
  const { mutateAsync: playTrivia, isPending } = usePlayCustomTrivia();
  const { data: myPoints, refetch } = useGetMyPoints();
  const navigate = useNavigate();

  const questions =
    game.gameType.__kind__ === "customTrivia"
      ? ((game.gameType as any).customTrivia
          .questions as CustomTriviaQuestion[])
      : [];

  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [pointsEarned, setPointsEarned] = useState<bigint>(0n);
  const [cooldownMs, setCooldownMsState] = useState(() =>
    getTimeRemaining(principalStr, gameId),
  );

  useEffect(() => {
    if (cooldownMs <= 0) return;
    const id = setInterval(() => {
      setCooldownMsState((prev) => {
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

  const question = questions[currentQ];
  const isLast = currentQ === questions.length - 1;

  const selectOption = (idx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQ]: idx }));
  };

  const next = () => {
    if (currentQ < questions.length - 1) setCurrentQ((p) => p + 1);
  };

  const submit = async () => {
    const answers = questions.map((_q, i) => ({
      questionId: BigInt(i),
      answerIndex: BigInt(selectedAnswers[i] ?? 0),
    }));
    try {
      const pts = await playTrivia({ gameId: game.id, answers });
      setCooldown(principalStr, gameId);
      setCooldownMsState(COOLDOWN_MS);
      setPointsEarned(pts);
      setSubmitted(true);
      await refetch();
      toast.success(`+${pts} points earned! \uD83C\uDF89`);
    } catch {
      toast.error("Failed to submit answers");
    }
  };

  const reset = () => {
    setCurrentQ(0);
    setSelectedAnswers({});
    setSubmitted(false);
    setPointsEarned(0n);
  };

  if (cooldownMs > 0 && !submitted) {
    return (
      <div className="glass-card rounded-2xl px-8 py-8 text-center max-w-md mx-auto">
        <p className="text-lg font-semibold mb-2">Come back tomorrow!</p>
        <p className="text-muted-foreground mb-4">
          You already played this game today.
        </p>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          Next play in
        </p>
        <p className="text-2xl font-bold text-primary tabular-nums">
          {formatCountdown(cooldownMs)}
        </p>
        <Button
          variant="ghost"
          className="mt-6 text-muted-foreground"
          onClick={() => navigate({ to: "/games" })}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Games
        </Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-8 text-center max-w-md mx-auto"
        data-ocid="games.success_state"
      >
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold gradient-text mb-2">
          Quiz Complete!
        </h2>
        <div className="my-4">
          <span className="text-5xl font-bold text-primary">
            +{pointsEarned.toString()}
          </span>
          <span className="text-xl text-muted-foreground ml-2">pts earned</span>
        </div>
        <p className="text-muted-foreground mb-6">
          Total points: {myPoints?.toString() ?? "0"}
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={reset}
            disabled={cooldownMs > 0}
            data-ocid="games.secondary_button"
          >
            Play Again
          </Button>
          <Button
            className="flex-1 gradient-bg border-0 text-white rounded-full"
            onClick={() => navigate({ to: "/games" })}
            data-ocid="games.primary_button"
          >
            Back to Games
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          Question {currentQ + 1} / {questions.length}
        </span>
        <div className="glass-card rounded-xl px-3 py-1 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-sm font-bold">
            {myPoints?.toString() ?? "0"} pts
          </span>
        </div>
      </div>

      <div className="w-full bg-secondary/30 rounded-full h-1.5 mb-6">
        <div
          className="gradient-bg h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
        />
      </div>

      <motion.div
        key={currentQ}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card rounded-2xl p-6"
      >
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          +{question.pointsReward.toString()} pts for correct answer
        </p>
        <h3 className="text-lg font-semibold mb-6">{question.text}</h3>

        <div className="space-y-3">
          {question.options.map((option, idx) => (
            <button
              type="button"
              key={option}
              onClick={() => selectOption(idx)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 ${
                selectedAnswers[currentQ] === idx
                  ? "border-primary bg-primary/20 text-foreground"
                  : "border-border/50 hover:border-primary/40 text-muted-foreground hover:text-foreground"
              }`}
              data-ocid="games.toggle"
            >
              <span className="font-medium mr-2">
                {String.fromCharCode(65 + idx)}.
              </span>
              {option}
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          {isLast ? (
            <Button
              className="gradient-bg border-0 text-white rounded-full px-8"
              onClick={submit}
              disabled={selectedAnswers[currentQ] === undefined || isPending}
              data-ocid="games.submit_button"
            >
              {isPending ? "Submitting..." : "Submit"}
            </Button>
          ) : (
            <Button
              className="gradient-bg border-0 text-white rounded-full px-8"
              onClick={next}
              disabled={selectedAnswers[currentQ] === undefined}
              data-ocid="games.primary_button"
            >
              Next
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function CustomGamePage() {
  const { id } = useParams({ from: "/games/custom/$id" });
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: customGames, isLoading } = useGetAllCustomGames();
  const { isBanned } = useBanStatus();
  const navigate = useNavigate();

  const principalStr = identity?.getPrincipal().toText() ?? "";
  const game = customGames?.find((g) => g.id === BigInt(id));

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
          Log in to play community games and earn points.
        </p>
        <Button
          className="gradient-bg border-0 text-white rounded-full px-8 glow-cyan"
          onClick={login}
          disabled={loginStatus === "logging-in"}
          data-ocid="games.primary_button"
        >
          {loginStatus === "logging-in" ? "Connecting..." : "Log In"}
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="container mx-auto px-4 py-20 text-center"
        data-ocid="games.loading_state"
      >
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div
        className="container mx-auto px-4 py-20 max-w-md text-center"
        data-ocid="games.error_state"
      >
        <h2 className="text-2xl font-bold mb-2">Game not found</h2>
        <p className="text-muted-foreground mb-6">
          This community game does not exist.
        </p>
        <Button
          className="gradient-bg border-0 text-white rounded-full px-8"
          onClick={() => navigate({ to: "/games" })}
          data-ocid="games.primary_button"
        >
          Back to Games
        </Button>
      </div>
    );
  }

  const isTrivia = game.gameType.__kind__ === "customTrivia";

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground mb-4"
          onClick={() => navigate({ to: "/games" })}
          data-ocid="games.secondary_button"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Games
        </Button>

        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isTrivia
                ? "bg-gradient-to-br from-amber-500 to-orange-600"
                : "bg-gradient-to-br from-violet-500 to-fuchsia-600"
            }`}
          >
            {isTrivia ? (
              <Brain className="w-6 h-6 text-white" />
            ) : (
              <RotateCcw className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">{game.title}</h1>
            <p className="text-sm text-muted-foreground">
              {isTrivia ? "Community Trivia" : "Community Spin Wheel"} \u00b7
              1-day cooldown
            </p>
          </div>
        </div>
      </motion.div>

      {isTrivia ? (
        <CustomTriviaGame game={game} principalStr={principalStr} />
      ) : (
        <CustomSpinWheelGame game={game} principalStr={principalStr} />
      )}
    </div>
  );
}
