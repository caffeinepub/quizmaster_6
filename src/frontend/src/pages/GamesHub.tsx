import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { Brain, Crown, Gamepad2, RotateCcw, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetMyPoints } from "../hooks/useQueries";

export default function GamesHub() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: myPoints } = useGetMyPoints();

  const games = [
    {
      id: "memory",
      title: "Memory Match",
      description:
        "Flip cards to find matching pairs. Earn 10 points per match!",
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
        "Spin the wheel and win up to 200 bonus points! 30s cooldown.",
      icon: RotateCcw,
      path: "/games/spinwheel",
      gradient: "from-purple-500 to-pink-600",
      glowClass: "glow-purple",
      badge: "Up to 200 pts",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Header */}
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

      {/* Points & Leaderboard banner */}
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
                  : "—"
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

      {/* Game cards */}
      <div className="grid md:grid-cols-2 gap-6">
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

      {/* Crown hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
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
            — revealing answers to every quiz.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
