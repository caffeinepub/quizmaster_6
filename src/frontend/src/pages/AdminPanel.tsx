import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Crown, Lock, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import type { Question } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetAdminQuizAnswers,
  useGetAllPlayerPoints,
  useGetMyPoints,
} from "../hooks/useQueries";

const SKELETON_KEYS = ["sk1", "sk2", "sk3"];

function AnswerDisplay({ q }: { q: Question }) {
  if (q.questionType.__kind__ === "trueFalse") {
    const ans = q.questionType.trueFalse.correctAnswer;
    return (
      <div className="mt-2">
        <span className="text-sm text-muted-foreground">Answer: </span>
        <Badge
          className={
            ans
              ? "bg-green-500/20 text-green-400 border-green-500/40"
              : "bg-red-500/20 text-red-400 border-red-500/40"
          }
        >
          {ans ? "True" : "False"}
        </Badge>
      </div>
    );
  }

  const { correctOption, options } = q.questionType.multipleChoice;
  return (
    <div className="mt-2 space-y-1">
      {options.map((opt) => {
        const optIdx = BigInt(options.indexOf(opt));
        return (
          <div
            key={opt}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
              optIdx === correctOption
                ? "bg-green-500/20 border border-green-500/40 text-green-300"
                : "bg-secondary/40 text-muted-foreground"
            }`}
          >
            {optIdx === correctOption && (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
            )}
            {opt}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminPanel() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: myPoints, isLoading: loadingPoints } = useGetMyPoints();
  const { data: allPoints, isLoading: loadingAll } = useGetAllPlayerPoints();
  const myPrincipal = identity?.getPrincipal().toString();

  // Determine if caller is #1
  const sorted = allPoints
    ? [...allPoints].sort((a, b) =>
        b.points > a.points ? 1 : b.points < a.points ? -1 : 0,
      )
    : [];

  const topPlayer = sorted[0]?.player.toString();
  const isTopPlayer =
    !!myPrincipal && topPlayer === myPrincipal && (myPoints ?? 0n) > 0n;
  const myRank =
    sorted.findIndex((e) => e.player.toString() === myPrincipal) + 1;

  const { data: quizAnswers, isLoading: loadingAnswers } =
    useGetAdminQuizAnswers(isTopPlayer);

  const isLoading = loadingPoints || loadingAll;

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Admin Panel</h2>
        <p className="text-muted-foreground mb-6">
          Log in to check your access level.
        </p>
        <Button
          className="gradient-bg border-0 text-white rounded-full px-8 glow-cyan"
          onClick={login}
          disabled={loginStatus === "logging-in"}
          data-ocid="admin.primary_button"
        >
          {loginStatus === "logging-in" ? "Connecting..." : "Log In"}
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="container mx-auto px-4 py-10 max-w-3xl"
        data-ocid="admin.loading_state"
      >
        <Skeleton className="h-16 rounded-2xl mb-4" />
        <Skeleton className="h-40 rounded-2xl mb-4" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  if (!isTopPlayer) {
    return (
      <div
        className="container mx-auto px-4 py-20 max-w-md text-center"
        data-ocid="admin.error_state"
      >
        <Lock className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-3">Access Denied</h2>
        <p className="text-muted-foreground mb-2">
          Only the #1 all-time points leader can access this panel.
        </p>
        {myRank > 0 ? (
          <p className="text-sm text-muted-foreground mb-6">
            Your current rank:{" "}
            <strong className="text-foreground">#{myRank}</strong> with{" "}
            <strong className="text-primary">
              {myPoints?.toString() ?? "0"}
            </strong>{" "}
            points.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mb-6">
            You haven&apos;t earned any points yet. Play mini games!
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <Link to="/games">
            <Button
              className="gradient-bg border-0 text-white rounded-full glow-cyan"
              data-ocid="admin.primary_button"
            >
              Play Mini Games
            </Button>
          </Link>
          <Link to="/points-leaderboard">
            <Button
              variant="outline"
              className="rounded-full"
              data-ocid="admin.secondary_button"
            >
              View Leaderboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-8 h-8 text-yellow-400" />
          <h1 className="text-3xl font-bold gradient-text">Admin Panel</h1>
          <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/40">
            <Crown className="w-3 h-3 mr-1" />
            #1 Player
          </Badge>
        </div>
        <p className="text-muted-foreground">
          You are the #1 all-time points leader. Here are all quiz answers.
        </p>
      </motion.div>

      {loadingAnswers ? (
        <div className="space-y-4" data-ocid="admin.loading_state">
          {SKELETON_KEYS.map((k) => (
            <Skeleton key={k} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : !quizAnswers || quizAnswers.length === 0 ? (
        <div
          className="glass-card rounded-2xl p-12 text-center"
          data-ocid="admin.empty_state"
        >
          <p className="text-muted-foreground">No quizzes found.</p>
        </div>
      ) : (
        <div className="space-y-6" data-ocid="admin.panel">
          {quizAnswers.map((qwa, qi) => (
            <motion.div
              key={qwa.quiz.id.toString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qi * 0.08 }}
              className="glass-card rounded-2xl overflow-hidden"
              data-ocid={`admin.item.${qi + 1}`}
            >
              <div className="px-6 py-4 border-b border-border/40">
                <h2 className="text-lg font-semibold">{qwa.quiz.title}</h2>
                {qwa.quiz.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {qwa.quiz.description}
                  </p>
                )}
              </div>
              <div className="px-6 py-4 space-y-5">
                {qwa.questions.map((q, qi2) => (
                  <div key={q.id.toString()} data-ocid={`admin.item.${qi + 1}`}>
                    <p className="font-medium">
                      <span className="text-muted-foreground text-sm mr-2">
                        Q{qi2 + 1}.
                      </span>
                      {q.text}
                    </p>
                    <AnswerDisplay q={q} />
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
