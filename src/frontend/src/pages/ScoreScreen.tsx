import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "@tanstack/react-router";
import { List, RotateCcw, Trophy } from "lucide-react";
import { motion } from "motion/react";

function getMotivation(pct: number) {
  if (pct === 100)
    return {
      msg: "Perfect Score! You're a Quiz Legend! 🏆",
      color: "text-yellow-400",
    };
  if (pct >= 80)
    return {
      msg: "Excellent Work! Almost Perfect! 🌟",
      color: "text-green-400",
    };
  if (pct >= 60)
    return { msg: "Good Job! Keep Practicing! 👍", color: "text-blue-400" };
  if (pct >= 40)
    return { msg: "Not Bad! You Can Do Better! 💪", color: "text-orange-400" };
  return {
    msg: "Keep Studying! Every Attempt Counts! 📚",
    color: "text-red-400",
  };
}

export default function ScoreScreen() {
  const { id } = useParams({ from: "/quiz/$id/score" });
  const navigate = useNavigate();

  // Score stored in sessionStorage by PlayQuiz page
  const stored = sessionStorage.getItem(`quiz-score-${id}`);
  const { score, total } = stored
    ? (JSON.parse(stored) as { score: number; total: number })
    : { score: 0, total: 0 };
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const { msg, color } = getMotivation(pct);

  return (
    <div className="container mx-auto px-4 py-20 max-w-lg text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <div className="w-24 h-24 mx-auto mb-6 rounded-full gradient-bg flex items-center justify-center glow-cyan animate-float">
          <Trophy className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-3xl font-extrabold mb-2">Quiz Complete!</h1>
        <p className={`text-lg font-semibold mb-8 ${color}`}>{msg}</p>

        <div className="glass-card rounded-3xl p-10 mb-8">
          <div className="text-7xl font-black gradient-text mb-2">{pct}%</div>
          <div className="text-muted-foreground text-lg">
            You answered{" "}
            <span className="font-bold text-foreground">{score}</span> out of{" "}
            <span className="font-bold text-foreground">{total}</span> correctly
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() =>
              navigate({ to: "/quiz/$id/leaderboard", params: { id } })
            }
            className="gradient-bg border-0 text-white font-semibold rounded-full px-8 glow-cyan"
            data-ocid="score.primary_button"
          >
            <Trophy className="w-4 h-4 mr-2" />
            View Leaderboard
          </Button>
          <Button
            onClick={() => navigate({ to: "/" })}
            variant="outline"
            className="rounded-full px-8 border-border"
            data-ocid="score.secondary_button"
          >
            <List className="w-4 h-4 mr-2" />
            Back to Quizzes
          </Button>
          <Button
            onClick={() => navigate({ to: "/quiz/$id", params: { id } })}
            variant="outline"
            className="rounded-full px-8 border-border"
            data-ocid="score.secondary_button"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry Quiz
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
