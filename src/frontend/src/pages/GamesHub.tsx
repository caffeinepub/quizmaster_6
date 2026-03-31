import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, useNavigate } from "@tanstack/react-router";
import { Brain, Crown, Gamepad2, RotateCcw, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetAllCustomGames, useGetMyPoints } from "../hooks/useQueries";

const COOLDOWN_MS = 24 * 60 * 60 * 1000;
const BONUS_COOLDOWN_MS = 200 * 60 * 60 * 1000;

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

function useCustomGameCooldown(principalStr: string, gameId: string) {
  const key = `custom_game_cooldown_${principalStr}_${gameId}`;
  const [cooldownMs, setCooldownMs] = useState(() => {
    if (!principalStr) return 0;
    const stored = localStorage.getItem(key);
    if (!stored) return 0;
    const remaining = COOLDOWN_MS - (Date.now() - Number(stored));
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

  return cooldownMs;
}

function useBonusCooldown(principalStr: string, itemId: string) {
  const key = `bonus_${itemId}_${principalStr}`;
  const [cooldownMs, setCooldownMs] = useState(() => {
    if (!principalStr) return 0;
    const stored = localStorage.getItem(key);
    if (!stored) return 0;
    const remaining = BONUS_COOLDOWN_MS - (Date.now() - Number(stored));
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
    setCooldownMs(BONUS_COOLDOWN_MS);
  }

  return { cooldownMs, startCooldown };
}

const BONUS_ITEMS = [
  {
    id: "daily_chest",
    name: "Daily Chest",
    emoji: "🎁",
    description: "Open for a surprise reward! Awards 10–100 random points.",
    minPts: 10,
    maxPts: 100,
    gradient: "from-amber-500 to-orange-600",
    glowClass: "shadow-amber-500/30",
  },
  {
    id: "mystery_bonus",
    name: "Mystery Bonus",
    emoji: "🎲",
    description: "Roll the dice and win! Awards 20–150 random points.",
    minPts: 20,
    maxPts: 150,
    gradient: "from-violet-500 to-purple-600",
    glowClass: "shadow-violet-500/30",
  },
  {
    id: "lucky_star",
    name: "Lucky Star",
    emoji: "⭐",
    description: "Wish upon a star! Awards 5–200 random points.",
    minPts: 5,
    maxPts: 200,
    gradient: "from-cyan-500 to-blue-600",
    glowClass: "shadow-cyan-500/30",
  },
];

interface BonusCardProps {
  item: (typeof BONUS_ITEMS)[number];
  principalStr: string;
  isLoggedIn: boolean;
  onLogin: () => void;
  loginStatus: string;
  index: number;
}

function BonusCard({
  item,
  principalStr,
  isLoggedIn,
  onLogin,
  loginStatus,
  index,
}: BonusCardProps) {
  const { actor } = useActor();
  const { cooldownMs, startCooldown } = useBonusCooldown(principalStr, item.id);
  const [claiming, setClaiming] = useState(false);

  async function handleClaim() {
    if (!actor || claiming || cooldownMs > 0) return;
    const pts =
      Math.floor(Math.random() * (item.maxPts - item.minPts + 1)) + item.minPts;
    setClaiming(true);
    try {
      await actor.awardPoints(BigInt(pts));
      startCooldown();
      toast.success(`${item.emoji} ${item.name}: You earned ${pts} points!`);
    } catch {
      toast.error("Failed to claim bonus. Try again.");
    } finally {
      setClaiming(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      data-ocid={`games.bonus.item.${index}`}
    >
      <Card className="glass-card border-border/50 hover:border-primary/40 transition-all duration-300 group">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-2xl shadow-lg ${item.glowClass} mb-2`}
            >
              {item.emoji}
            </div>
            <Badge variant="secondary" className="text-xs">
              {item.minPts}–{item.maxPts} pts
            </Badge>
          </div>
          <CardTitle className="text-lg">{item.name}</CardTitle>
          <CardDescription>{item.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {cooldownMs > 0 && (
            <div className="glass-card rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-muted-foreground">Resets in</p>
              <p className="text-sm font-bold text-primary tabular-nums">
                {formatCountdown(cooldownMs)}
              </p>
            </div>
          )}
          {isLoggedIn ? (
            <Button
              className="w-full gradient-bg border-0 text-white font-semibold rounded-full disabled:opacity-50"
              onClick={handleClaim}
              disabled={cooldownMs > 0 || claiming}
              data-ocid={`games.bonus.primary_button.${index}`}
            >
              <Zap className="w-4 h-4 mr-2" />
              {claiming ? "Claiming..." : cooldownMs > 0 ? "Claimed" : "Claim"}
            </Button>
          ) : (
            <Button
              className="w-full gradient-bg border-0 text-white font-semibold rounded-full"
              onClick={onLogin}
              disabled={loginStatus === "logging-in"}
              data-ocid={`games.bonus.primary_button.${index}`}
            >
              Log In to Claim
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function GamesHub() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: myPoints } = useGetMyPoints();
  const { data: customGames } = useGetAllCustomGames();
  const navigate = useNavigate();

  const principalStr = identity?.getPrincipal().toText() ?? "";

  const games = [
    {
      id: "memory",
      title: "Memory Match",
      description:
        "Flip cards to find matching pairs. Earn 10 points per pair!",
      icon: Brain,
      path: "/games/memory",
      gradient: "from-cyan-500 to-blue-600",
      glowClass: "glow-cyan",
      badge: "10 pts/pair",
    },
    {
      id: "spinwheel",
      title: "Spin Wheel",
      description:
        "Spin the wheel and win up to 200 bonus points! 1-day cooldown.",
      icon: RotateCcw,
      path: "/games/spinwheel",
      gradient: "from-purple-500 to-pink-600",
      glowClass: "glow-purple",
      badge: "Up to 200 pts",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 mb-3">
          <Gamepad2 className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold gradient-text">Mini Games</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Play games, earn points, and claim the #1 spot!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center glow-cyan">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Your Total Points</p>
            <p className="text-3xl font-bold gradient-text">
              {identity
                ? myPoints !== undefined
                  ? myPoints.toString()
                  : "\u2014"
                : "Log in to earn"}
            </p>
          </div>
        </div>
        <Link to="/points-leaderboard" data-ocid="games.link">
          <Button
            variant="outline"
            className="gap-2 border-primary/40 hover:border-primary"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            Points Leaderboard
          </Button>
        </Link>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {games.map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
          >
            <Card className="glass-card border-border/50 hover:border-primary/50 transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.gradient} flex items-center justify-center ${game.glowClass} mb-3`}
                  >
                    <game.icon className="w-7 h-7 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {game.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{game.title}</CardTitle>
                <CardDescription>{game.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {identity ? (
                  <Link
                    to={game.path as "/games/memory" | "/games/spinwheel"}
                    data-ocid={`games.${game.id}.primary_button`}
                  >
                    <Button className="w-full gradient-bg border-0 text-white font-semibold rounded-full glow-cyan group-hover:opacity-90">
                      <Gamepad2 className="w-4 h-4 mr-2" />
                      Play Now
                    </Button>
                  </Link>
                ) : (
                  <Button
                    className="w-full gradient-bg border-0 text-white font-semibold rounded-full glow-cyan"
                    onClick={login}
                    disabled={loginStatus === "logging-in"}
                    data-ocid={`games.${game.id}.primary_button`}
                  >
                    Log In to Play
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Daily Bonuses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mb-10"
      >
        <div className="flex items-center gap-2 mb-5">
          <span className="text-2xl">🎁</span>
          <h2 className="text-2xl font-bold gradient-text">Daily Bonuses</h2>
          <Badge variant="secondary" className="ml-2">
            Resets every 24h
          </Badge>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {BONUS_ITEMS.map((item, i) => (
            <BonusCard
              key={item.id}
              item={item}
              principalStr={principalStr}
              isLoggedIn={!!identity}
              onLogin={login}
              loginStatus={loginStatus}
              index={i + 1}
            />
          ))}
        </div>
      </motion.div>

      {/* Community Games */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Crown className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold gradient-text">Community Games</h2>
          <Badge variant="secondary" className="ml-2">
            By #1 Player
          </Badge>
        </div>

        {!customGames || customGames.length === 0 ? (
          <div
            className="glass-card rounded-2xl p-8 text-center"
            data-ocid="games.community.empty_state"
          >
            <Crown className="w-10 h-10 text-yellow-400/50 mx-auto mb-3" />
            <p className="text-muted-foreground">
              No community games yet — the #1 player can create them in the{" "}
              <Link
                to="/admin"
                className="text-primary underline"
                data-ocid="games.link"
              >
                Admin Panel
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {customGames.map((game, i) => (
              <CustomGameCard
                key={game.id.toString()}
                game={game}
                index={i + 1}
                principalStr={principalStr}
                isLoggedIn={!!identity}
                onLogin={login}
                loginStatus={loginStatus}
                onPlay={() =>
                  navigate({
                    to: "/games/custom/$id",
                    params: { id: game.id.toString() },
                  })
                }
              />
            ))}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10 glass-card rounded-2xl p-5 flex items-center gap-4"
      >
        <Crown className="w-8 h-8 text-yellow-400 shrink-0" />
        <div>
          <p className="font-semibold text-foreground">
            Become the #1 All-Time Player
          </p>
          <p className="text-sm text-muted-foreground">
            The player with the most total points unlocks the exclusive{" "}
            <Link
              to="/admin"
              className="text-primary underline"
              data-ocid="games.link"
            >
              Admin Panel
            </Link>{" "}
            — revealing answers to every quiz and letting you create community
            games.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

interface CustomGameCardProps {
  game: import("../backend.d").CustomGame;
  index: number;
  principalStr: string;
  isLoggedIn: boolean;
  onLogin: () => void;
  loginStatus: string;
  onPlay: () => void;
}

function CustomGameCard({
  game,
  index,
  principalStr,
  isLoggedIn,
  onLogin,
  loginStatus,
  onPlay,
}: CustomGameCardProps) {
  const cooldownMs = useCustomGameCooldown(principalStr, game.id.toString());
  const isTrivia = game.gameType.__kind__ === "customTrivia";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      data-ocid={`games.community.item.${index}`}
    >
      <Card className="glass-card border-border/50 hover:border-yellow-400/40 transition-all duration-300 group">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${
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
            <Badge
              variant="outline"
              className={`text-xs ${
                isTrivia
                  ? "border-amber-500/50 text-amber-400"
                  : "border-violet-500/50 text-violet-400"
              }`}
            >
              {isTrivia ? "Trivia" : "Spin Wheel"}
            </Badge>
          </div>
          <CardTitle className="text-lg">{game.title}</CardTitle>
          <CardDescription>
            {isTrivia
              ? `${(game.gameType as any).customTrivia.questions.length} questions — earn points for correct answers`
              : "Spin to win — community prizes"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {cooldownMs > 0 && (
            <div className="glass-card rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-muted-foreground">Next play in</p>
              <p className="text-sm font-bold text-primary tabular-nums">
                {formatCountdown(cooldownMs)}
              </p>
            </div>
          )}
          {isLoggedIn ? (
            <Button
              className="w-full gradient-bg border-0 text-white font-semibold rounded-full disabled:opacity-50"
              onClick={onPlay}
              disabled={cooldownMs > 0}
              data-ocid={`games.community.primary_button.${index}`}
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              {cooldownMs > 0 ? "On Cooldown" : "Play Now"}
            </Button>
          ) : (
            <Button
              className="w-full gradient-bg border-0 text-white font-semibold rounded-full"
              onClick={onLogin}
              disabled={loginStatus === "logging-in"}
              data-ocid={`games.community.primary_button.${index}`}
            >
              Log In to Play
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
