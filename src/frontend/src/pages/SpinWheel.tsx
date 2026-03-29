import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { RotateCcw, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAwardPoints, useGetMyPoints } from "../hooks/useQueries";

const SEGMENTS = [
  { label: "10", value: 10, color: "#3b82f6" },
  { label: "25", value: 25, color: "#8b5cf6" },
  { label: "50", value: 50, color: "#06b6d4" },
  { label: "75", value: 75, color: "#ec4899" },
  { label: "100", value: 100, color: "#10b981" },
  { label: "150", value: 150, color: "#f59e0b" },
  { label: "200", value: 200, color: "#ef4444" },
  { label: "5", value: 5, color: "#6366f1" },
];

const COOLDOWN_SECS = 30;
const SEG_ANGLE = 360 / SEGMENTS.length;

function drawWheel(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = cx - 8;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  SEGMENTS.forEach((seg, i) => {
    const startAngle = ((i * SEG_ANGLE - 90) * Math.PI) / 180;
    const endAngle = (((i + 1) * SEG_ANGLE - 90) * Math.PI) / 180;
    const midAngle = (startAngle + endAngle) / 2;

    // Segment fill
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label
    ctx.save();
    ctx.translate(
      cx + r * 0.65 * Math.cos(midAngle),
      cy + r * 0.65 * Math.sin(midAngle),
    );
    ctx.rotate(midAngle + Math.PI / 2);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Plus Jakarta Sans, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(seg.label, 0, 0);
    ctx.restore();
  });

  // Center circle
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fillStyle = "#1e1b4b";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 3;
  ctx.stroke();
}

export default function SpinWheel() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: myPoints, refetch: refetchPoints } = useGetMyPoints();
  const { mutateAsync: awardPoints } = useAwardPoints();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (canvasRef.current) drawWheel(canvasRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(COOLDOWN_SECS);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const spin = async () => {
    if (spinning || cooldown > 0 || !identity) return;
    setResult(null);
    setSpinning(true);

    const extraSpins = 3 + Math.floor(Math.random() * 5); // 3-7 full rotations
    const stopDeg = Math.floor(Math.random() * 360);
    const totalDeg = extraSpins * 360 + stopDeg;
    const finalRot = rotation + totalDeg;
    setRotation(finalRot);

    await new Promise((r) => setTimeout(r, 4500));

    // Figure out winning segment
    // The pointer is at the top (0 deg). After rotation, pointer points at:
    const normalised = ((finalRot % 360) + 360) % 360;
    // The segment whose start is at (360 - normalised) relative
    const pointerAngle = (360 - normalised + 90) % 360; // offset -90 because we started at -90
    const segIndex = Math.floor(pointerAngle / SEG_ANGLE) % SEGMENTS.length;
    const won = SEGMENTS[segIndex].value;

    setResult(won);
    setSpinning(false);
    startCooldown();

    try {
      await awardPoints(BigInt(won));
      await refetchPoints();
      toast.success(`+${won} points! 🎉`);
    } catch {
      toast.error("Failed to award points");
    }
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <RotateCcw className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Login to Spin</h2>
        <p className="text-muted-foreground mb-6">
          Log in to spin the wheel and earn points.
        </p>
        <Button
          className="gradient-bg border-0 text-white rounded-full px-8 glow-cyan"
          onClick={login}
          disabled={loginStatus === "logging-in"}
          data-ocid="spinwheel.primary_button"
        >
          {loginStatus === "logging-in" ? "Connecting..." : "Log In"}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Spin Wheel</h1>
          <p className="text-sm text-muted-foreground">
            Win up to 200 bonus points!
          </p>
        </div>
        <div className="glass-card rounded-xl px-4 py-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="font-bold">{myPoints?.toString() ?? "0"}</span>
          <span className="text-xs text-muted-foreground">pts</span>
        </div>
      </div>

      {/* Wheel */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          {/* Pointer */}
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
          />
        </div>

        {/* Spin button */}
        <Button
          className="w-40 h-14 text-lg font-bold gradient-bg border-0 text-white rounded-full glow-cyan disabled:opacity-50"
          onClick={spin}
          disabled={spinning || cooldown > 0}
          data-ocid="spinwheel.primary_button"
        >
          {spinning ? (
            <RotateCcw className="w-5 h-5 animate-spin" />
          ) : cooldown > 0 ? (
            `Wait ${cooldown}s`
          ) : (
            "SPIN!"
          )}
        </Button>

        {cooldown > 0 && (
          <p className="text-sm text-muted-foreground">
            Next spin in {cooldown} seconds
          </p>
        )}

        <Link to="/games">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            data-ocid="spinwheel.link"
          >
            ← Back to Games
          </Button>
        </Link>
      </div>

      {/* Result popup */}
      <AnimatePresence>
        {result !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setResult(null)}
            data-ocid="spinwheel.modal"
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
                <span className="text-6xl font-bold text-primary">
                  +{result}
                </span>
                <span className="text-2xl text-muted-foreground ml-2">pts</span>
              </div>
              <Button
                className="w-full gradient-bg border-0 text-white rounded-full glow-cyan"
                onClick={() => setResult(null)}
                data-ocid="spinwheel.close_button"
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
