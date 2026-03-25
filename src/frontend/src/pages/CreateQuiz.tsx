import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { Check, ChevronRight, Loader2, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAddQuestion, useCreateQuiz } from "../hooks/useQueries";

type QuestionType = "multipleChoice" | "trueFalse";

interface DraftQuestion {
  id: string;
  type: QuestionType;
  text: string;
  options: [string, string, string, string];
  correctOption: number;
  correctAnswer: boolean;
}

let questionCounter = 0;
const emptyQuestion = (): DraftQuestion => ({
  id: `q-${++questionCounter}`,
  type: "multipleChoice",
  text: "",
  options: ["", "", "", ""],
  correctOption: 0,
  correctAnswer: true,
});

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

type Step = "info" | "questions";

export default function CreateQuiz() {
  const { identity, login } = useInternetIdentity();
  const navigate = useNavigate();
  const createQuiz = useCreateQuiz();
  const addQuestion = useAddQuestion();

  const [step, setStep] = useState<Step>("info");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quizId, setQuizId] = useState<bigint | null>(null);
  const [questions, setQuestions] = useState<DraftQuestion[]>([
    emptyQuestion(),
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Login Required</h2>
        <p className="text-muted-foreground mb-6">
          You need to log in to create quizzes.
        </p>
        <Button
          onClick={login}
          className="gradient-bg border-0 text-white rounded-full px-8"
          data-ocid="create.primary_button"
        >
          Log In to Continue
        </Button>
      </div>
    );
  }

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const id = await createQuiz.mutateAsync({
        title: title.trim(),
        description: description.trim(),
      });
      setQuizId(id);
      setStep("questions");
      toast.success("Quiz created! Now add questions.");
    } catch {
      toast.error("Failed to create quiz.");
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quizId) return;
    const validQs = questions.filter((q) => q.text.trim());
    if (validQs.length === 0) {
      toast.error("Add at least one question.");
      return;
    }
    setIsSubmitting(true);
    try {
      await Promise.all(
        validQs.map((q) =>
          addQuestion.mutateAsync({
            quizId,
            question: {
              id: 0n,
              text: q.text.trim(),
              quizId,
              questionType:
                q.type === "trueFalse"
                  ? {
                      __kind__: "trueFalse" as const,
                      trueFalse: { correctAnswer: q.correctAnswer },
                    }
                  : {
                      __kind__: "multipleChoice" as const,
                      multipleChoice: {
                        options: q.options.filter(Boolean),
                        correctOption: BigInt(q.correctOption),
                      },
                    },
            },
          }),
        ),
      );
      toast.success(`Quiz published with ${validQs.length} questions!`);
      navigate({ to: "/" });
    } catch {
      toast.error("Failed to save questions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateQuestion = (i: number, update: Partial<DraftQuestion>) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === i ? { ...q, ...update } : q)),
    );
  };

  const addNewQuestion = () =>
    setQuestions((prev) => [...prev, emptyQuestion()]);
  const removeQuestion = (i: number) =>
    setQuestions((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <Badge
            className={`rounded-full px-3 py-1 ${step === "info" ? "gradient-bg border-0 text-white" : "bg-green-500/20 text-green-400 border-green-500/30"}`}
          >
            {step === "info" ? "1" : <Check className="w-3 h-3" />}
          </Badge>
          <span
            className={
              step === "info" ? "font-semibold" : "text-muted-foreground"
            }
          >
            Quiz Details
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <Badge
            className={`rounded-full px-3 py-1 ${step === "questions" ? "gradient-bg border-0 text-white" : "bg-secondary border-border"}`}
          >
            2
          </Badge>
          <span
            className={
              step === "questions" ? "font-semibold" : "text-muted-foreground"
            }
          >
            Add Questions
          </span>
        </div>

        {step === "info" ? (
          <div className="glass-card rounded-2xl p-8">
            <h1 className="text-2xl font-bold mb-6 gradient-text">
              Create a New Quiz
            </h1>
            <form onSubmit={handleCreateQuiz} className="space-y-5">
              <div>
                <Label htmlFor="quiz-title">Quiz Title *</Label>
                <Input
                  id="quiz-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Ultimate Science Challenge"
                  className="mt-1 bg-secondary border-border"
                  data-ocid="create.input"
                />
              </div>
              <div>
                <Label htmlFor="quiz-desc">Description</Label>
                <Textarea
                  id="quiz-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell players what this quiz is about…"
                  className="mt-1 bg-secondary border-border resize-none"
                  rows={3}
                  data-ocid="create.textarea"
                />
              </div>
              <Button
                type="submit"
                disabled={!title.trim() || createQuiz.isPending}
                className="w-full gradient-bg border-0 text-white font-semibold rounded-full"
                data-ocid="create.submit_button"
              >
                {createQuiz.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Continue to Questions
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold gradient-text">
                Add Questions
              </h1>
              <span className="text-muted-foreground text-sm">
                {questions.length} question{questions.length !== 1 ? "s" : ""}
              </span>
            </div>

            {questions.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card rounded-2xl p-6 space-y-4"
                data-ocid={`question.item.${i + 1}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm text-muted-foreground">
                    Question {i + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {(["multipleChoice", "trueFalse"] as QuestionType[]).map(
                        (t) => (
                          <Button
                            key={t}
                            size="sm"
                            variant={q.type === t ? "default" : "outline"}
                            onClick={() => updateQuestion(i, { type: t })}
                            className={`text-xs rounded-full ${q.type === t ? "gradient-bg border-0 text-white" : "border-border"}`}
                            data-ocid={`question.toggle.${i + 1}`}
                          >
                            {t === "multipleChoice"
                              ? "Multiple Choice"
                              : "True/False"}
                          </Button>
                        ),
                      )}
                    </div>
                    {questions.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeQuestion(i)}
                        className="text-destructive hover:text-destructive"
                        data-ocid={`question.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <Input
                  value={q.text}
                  onChange={(e) => updateQuestion(i, { text: e.target.value })}
                  placeholder="Enter your question…"
                  className="bg-secondary border-border"
                  data-ocid={`question.input.${i + 1}`}
                />

                {q.type === "multipleChoice" ? (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Options (click radio to set correct answer)
                    </Label>
                    {OPTION_LABELS.map((label, oi) => (
                      <div key={label} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuestion(i, { correctOption: oi })
                          }
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            q.correctOption === oi
                              ? "border-primary bg-primary"
                              : "border-border"
                          }`}
                        >
                          {q.correctOption === oi && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </button>
                        <Input
                          value={q.options[oi]}
                          onChange={(e) => {
                            const newOpts: [string, string, string, string] = [
                              ...q.options,
                            ] as [string, string, string, string];
                            newOpts[oi] = e.target.value;
                            updateQuestion(i, { options: newOpts });
                          }}
                          placeholder={`Option ${label}`}
                          className="bg-secondary border-border text-sm"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Correct Answer
                    </Label>
                    <div className="flex gap-3">
                      {([true, false] as boolean[]).map((val) => (
                        <Button
                          key={String(val)}
                          size="sm"
                          variant={
                            q.correctAnswer === val ? "default" : "outline"
                          }
                          onClick={() =>
                            updateQuestion(i, { correctAnswer: val })
                          }
                          className={`rounded-full px-6 ${q.correctAnswer === val ? "gradient-bg border-0 text-white" : "border-border"}`}
                        >
                          {val ? "True" : "False"}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            <Button
              variant="outline"
              onClick={addNewQuestion}
              className="w-full border-dashed border-border rounded-2xl py-6 text-muted-foreground hover:text-foreground hover:border-primary/50"
              data-ocid="question.add_button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>

            <Button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
              className="w-full gradient-bg border-0 text-white font-semibold rounded-full py-6 text-base glow-cyan"
              data-ocid="create.submit_button"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : null}
              Publish Quiz
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
