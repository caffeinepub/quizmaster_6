import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ChevronRight, Clock, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { T } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetQuiz,
  useGetQuizQuestions,
  useSubmitQuizAnswers,
} from "../hooks/useQueries";

export default function PlayQuiz() {
  const { id } = useParams({ from: "/quiz/$id" });
  const quizId = BigInt(id);
  const { identity, login } = useInternetIdentity();
  const navigate = useNavigate();

  const { data: quiz, isLoading: loadingQuiz } = useGetQuiz(quizId);
  const { data: questions, isLoading: loadingQs } = useGetQuizQuestions(quizId);
  const submitAnswers = useSubmitQuizAnswers();

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Map<string, T>>(new Map());
  const [selected, setSelected] = useState<number | boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Login Required</h2>
        <p className="text-muted-foreground mb-6">
          You need to log in to play quizzes.
        </p>
        <Button
          onClick={login}
          className="gradient-bg border-0 text-white rounded-full px-8"
          data-ocid="play.primary_button"
        >
          Log In to Play
        </Button>
      </div>
    );
  }

  if (loadingQuiz || loadingQs) {
    return (
      <div
        className="flex items-center justify-center py-32"
        data-ocid="play.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz || !questions || questions.length === 0) {
    return (
      <div
        className="container mx-auto px-4 py-24 text-center"
        data-ocid="play.empty_state"
      >
        <p className="text-muted-foreground text-lg">
          This quiz has no questions yet.
        </p>
        <Button
          onClick={() => navigate({ to: "/" })}
          className="mt-4 gradient-bg border-0 text-white rounded-full"
        >
          Back to Quizzes
        </Button>
      </div>
    );
  }

  const question = questions[current];
  const total = questions.length;
  const progress = (current / total) * 100;
  const isLast = current === total - 1;
  const isMultipleChoice = question.questionType.__kind__ === "multipleChoice";

  const handleSelect = (val: number | boolean) => setSelected(val);

  const handleNext = async () => {
    if (selected === null) return;

    const answer: T = {
      questionId: question.id,
      answer: isMultipleChoice
        ? {
            __kind__: "multipleChoice" as const,
            multipleChoice: BigInt(selected as number),
          }
        : { __kind__: "trueFalse" as const, trueFalse: selected as boolean },
    };

    const newAnswers = new Map(answers);
    newAnswers.set(question.id.toString(), answer);
    setAnswers(newAnswers);

    if (isLast) {
      setIsSubmitting(true);
      try {
        const score = await submitAnswers.mutateAsync({
          quizId,
          answers: Array.from(newAnswers.values()),
        });
        // Store score in sessionStorage for the score screen
        sessionStorage.setItem(
          `quiz-score-${id}`,
          JSON.stringify({ score: Number(score), total }),
        );
        navigate({ to: "/quiz/$id/score", params: { id } });
      } catch {
        toast.error("Failed to submit quiz.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrent((prev) => prev + 1);
      setSelected(null);
    }
  };

  const options =
    isMultipleChoice && question.questionType.__kind__ === "multipleChoice"
      ? question.questionType.multipleChoice.options
      : null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h1 className="font-bold text-xl">{quiz.title}</h1>
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <Clock className="w-4 h-4" />
            <span>
              {current + 1} / {total}
            </span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="glass-card rounded-2xl p-8"
        >
          <div className="mb-6">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {isMultipleChoice ? "Multiple Choice" : "True / False"}
            </span>
            <h2 className="text-xl font-bold mt-2">{question.text}</h2>
          </div>

          <div className="space-y-3">
            {isMultipleChoice && options ? (
              options.map((opt, i) => (
                <button
                  type="button"
                  key={opt || `opt-${i}`}
                  onClick={() => handleSelect(i)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 font-medium ${
                    selected === i
                      ? "border-primary/80 gradient-bg text-white"
                      : "border-border bg-secondary hover:border-primary/40 hover:bg-secondary/80"
                  }`}
                  data-ocid={`play.toggle.${i + 1}`}
                >
                  <span className="inline-block w-6 h-6 rounded-full border border-current mr-3 text-xs text-center leading-6">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              ))
            ) : (
              <div className="flex gap-4">
                {([true, false] as boolean[]).map((val) => (
                  <button
                    type="button"
                    key={String(val)}
                    onClick={() => handleSelect(val)}
                    className={`flex-1 py-5 rounded-xl border-2 transition-all duration-200 font-bold text-lg ${
                      selected === val
                        ? "border-primary/80 gradient-bg text-white"
                        : "border-border bg-secondary hover:border-primary/40"
                    }`}
                    data-ocid={`play.toggle.${val ? 1 : 2}`}
                  >
                    {val ? "✓ True" : "✗ False"}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleNext}
            disabled={selected === null || isSubmitting}
            className="w-full mt-8 gradient-bg border-0 text-white font-semibold rounded-full py-6 text-base glow-cyan"
            data-ocid="play.primary_button"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ChevronRight className="mr-2 h-5 w-5" />
            )}
            {isLast ? "Submit Quiz" : "Next Question"}
          </Button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
