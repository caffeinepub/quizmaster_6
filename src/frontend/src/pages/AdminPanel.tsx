import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Principal } from "@icp-sdk/core/principal";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Crown,
  Gamepad2,
  Loader2,
  Lock,
  Plus,
  Shield,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type {
  CustomTriviaQuestion,
  Question,
  SpinWheelSegment,
} from "../backend.d";
import { RankBadge } from "../components/RankBadge";
import { isOwnerPrincipal, useOwner } from "../contexts/OwnerContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAssignPlayerRank,
  useCreateCustomSpinWheel,
  useCreateCustomTrivia,
  useGetAdminQuizAnswers,
  useGetAllAssignedRanks,
  useGetAllCustomGames,
  useGetAllPlayerPoints,
  useGetMyPoints,
} from "../hooks/useQueries";

const SKELETON_KEYS = ["sk1", "sk2", "sk3"];
const RANK_OPTIONS = ["", "Noob", "Pro", "God", "Hacker", "Admin", "Owner"];
const RANK_LABELS: Record<string, string> = {
  "": "Auto (points-based)",
  Noob: "\ud83c\udf31 Noob",
  Pro: "\u2b50 Pro",
  God: "\u2728 God",
  Hacker: "\ud83d\udc80 Hacker",
  Admin: "\u26a1 Admin",
  Owner: "\ud83d\udc51 Owner",
};

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

type TriviaQuestionDraft = {
  id: number;
  text: string;
  options: [string, string, string, string];
  correctOption: number;
  pointsReward: number;
};

type SpinSegmentDraft = {
  id: number;
  segmentLabel: string;
  points: number;
};

function MiniGameCreator() {
  const createTrivia = useCreateCustomTrivia();
  const createSpin = useCreateCustomSpinWheel();
  const { data: customGames, isLoading: loadingGames } = useGetAllCustomGames();
  const qIdRef = useRef(1);
  const sIdRef = useRef(3);

  const [triviaTitle, setTriviaTitle] = useState("");
  const [triviaQuestions, setTriviaQuestions] = useState<TriviaQuestionDraft[]>(
    [
      {
        id: 0,
        text: "",
        options: ["", "", "", ""],
        correctOption: 0,
        pointsReward: 10,
      },
    ],
  );

  const [spinTitle, setSpinTitle] = useState("");
  const [spinSegments, setSpinSegments] = useState<SpinSegmentDraft[]>([
    { id: 1, segmentLabel: "", points: 50 },
    { id: 2, segmentLabel: "", points: 100 },
  ]);

  function addTriviaQuestion() {
    const id = qIdRef.current++;
    setTriviaQuestions((prev) => [
      ...prev,
      {
        id,
        text: "",
        options: ["", "", "", ""],
        correctOption: 0,
        pointsReward: 10,
      },
    ]);
  }

  function removeTriviaQuestion(id: number) {
    setTriviaQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function updateTriviaQuestion(
    id: number,
    field: keyof Omit<TriviaQuestionDraft, "id" | "options">,
    value: string | number,
  ) {
    setTriviaQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    );
  }

  function updateTriviaOption(id: number, optIdx: number, value: string) {
    setTriviaQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const opts: [string, string, string, string] = [...q.options] as [
          string,
          string,
          string,
          string,
        ];
        opts[optIdx] = value;
        return { ...q, options: opts };
      }),
    );
  }

  function addSpinSegment() {
    const id = sIdRef.current++;
    setSpinSegments((prev) => [...prev, { id, segmentLabel: "", points: 50 }]);
  }

  function removeSpinSegment(id: number) {
    setSpinSegments((prev) => prev.filter((s) => s.id !== id));
  }

  function updateSpinSegment(
    id: number,
    field: keyof Omit<SpinSegmentDraft, "id">,
    value: string | number,
  ) {
    setSpinSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  }

  async function handleCreateTrivia() {
    if (!triviaTitle.trim()) {
      toast.error("Please enter a game title.");
      return;
    }
    if (triviaQuestions.some((q) => !q.text.trim())) {
      toast.error("All questions must have text.");
      return;
    }
    const questions: CustomTriviaQuestion[] = triviaQuestions.map((q) => ({
      text: q.text,
      options: q.options,
      correctOption: BigInt(q.correctOption),
      pointsReward: BigInt(q.pointsReward),
    }));
    try {
      await createTrivia.mutateAsync({ title: triviaTitle, questions });
      toast.success("Trivia game created!");
      setTriviaTitle("");
      qIdRef.current = 1;
      setTriviaQuestions([
        {
          id: 0,
          text: "",
          options: ["", "", "", ""],
          correctOption: 0,
          pointsReward: 10,
        },
      ]);
    } catch (_e) {
      toast.error("Failed to create trivia game.");
    }
  }

  async function handleCreateSpin() {
    if (!spinTitle.trim()) {
      toast.error("Please enter a game title.");
      return;
    }
    if (spinSegments.some((s) => !s.segmentLabel.trim())) {
      toast.error("All segments must have a label.");
      return;
    }
    if (spinSegments.length < 2) {
      toast.error("Add at least 2 segments.");
      return;
    }
    const segments: SpinWheelSegment[] = spinSegments.map((s) => ({
      segmentLabel: s.segmentLabel,
      points: BigInt(s.points),
    }));
    try {
      await createSpin.mutateAsync({ title: spinTitle, segments });
      toast.success("Spin Wheel game created!");
      setSpinTitle("");
      sIdRef.current = 3;
      setSpinSegments([
        { id: 1, segmentLabel: "", points: 50 },
        { id: 2, segmentLabel: "", points: 100 },
      ]);
    } catch (_e) {
      toast.error("Failed to create spin wheel game.");
    }
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl overflow-hidden"
        data-ocid="admin.panel"
      >
        <div className="px-6 py-4 border-b border-border/40 flex items-center gap-3">
          <Gamepad2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Create Mini Game</h2>
          <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/40 text-xs">
            #1 Exclusive
          </Badge>
        </div>

        <div className="px-6 py-5">
          <Tabs defaultValue="trivia" data-ocid="admin.tab">
            <TabsList className="mb-6 rounded-xl bg-secondary/50">
              <TabsTrigger value="trivia" data-ocid="admin.tab">
                Trivia Challenge
              </TabsTrigger>
              <TabsTrigger value="spinwheel" data-ocid="admin.tab">
                Custom Spin Wheel
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trivia" className="space-y-5">
              <div>
                <Label htmlFor="trivia-title" className="text-sm mb-1.5 block">
                  Game Title
                </Label>
                <Input
                  id="trivia-title"
                  value={triviaTitle}
                  onChange={(e) => setTriviaTitle(e.target.value)}
                  placeholder="e.g. Ultimate Science Challenge"
                  className="bg-secondary/30 border-border/50"
                  data-ocid="admin.input"
                />
              </div>

              <div className="space-y-4">
                {triviaQuestions.map((q, qi) => (
                  <div
                    key={q.id}
                    className="rounded-xl border border-border/40 bg-secondary/20 p-4 space-y-3"
                    data-ocid={`admin.item.${qi + 1}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Question {qi + 1}
                      </span>
                      {triviaQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTriviaQuestion(q.id)}
                          className="text-destructive hover:opacity-70 transition-opacity"
                          data-ocid={`admin.delete_button.${qi + 1}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <Input
                      value={q.text}
                      onChange={(e) =>
                        updateTriviaQuestion(q.id, "text", e.target.value)
                      }
                      placeholder="Question text"
                      className="bg-secondary/30 border-border/50"
                      data-ocid="admin.input"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, oi) => (
                        <Input
                          key={String.fromCharCode(65 + oi)}
                          value={opt}
                          onChange={(e) =>
                            updateTriviaOption(q.id, oi, e.target.value)
                          }
                          placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                          className="bg-secondary/30 border-border/50 text-sm"
                          data-ocid="admin.input"
                        />
                      ))}
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground mb-1 block">
                          Correct Answer
                        </Label>
                        <select
                          value={q.correctOption}
                          onChange={(e) =>
                            updateTriviaQuestion(
                              q.id,
                              "correctOption",
                              Number(e.target.value),
                            )
                          }
                          className="w-full rounded-lg border border-border/50 bg-secondary/30 px-3 py-2 text-sm text-foreground"
                          data-ocid="admin.select"
                        >
                          <option value={0}>A</option>
                          <option value={1}>B</option>
                          <option value={2}>C</option>
                          <option value={3}>D</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground mb-1 block">
                          Points Reward
                        </Label>
                        <Input
                          type="number"
                          min={1}
                          value={q.pointsReward}
                          onChange={(e) =>
                            updateTriviaQuestion(
                              q.id,
                              "pointsReward",
                              Number(e.target.value),
                            )
                          }
                          className="bg-secondary/30 border-border/50"
                          data-ocid="admin.input"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTriviaQuestion}
                  className="rounded-full flex items-center gap-2"
                  data-ocid="admin.secondary_button"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateTrivia}
                  disabled={createTrivia.isPending}
                  className="gradient-bg border-0 text-white rounded-full glow-cyan flex items-center gap-2"
                  data-ocid="admin.primary_button"
                >
                  {createTrivia.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  {createTrivia.isPending
                    ? "Creating..."
                    : "Create Trivia Game"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="spinwheel" className="space-y-5">
              <div>
                <Label htmlFor="spin-title" className="text-sm mb-1.5 block">
                  Game Title
                </Label>
                <Input
                  id="spin-title"
                  value={spinTitle}
                  onChange={(e) => setSpinTitle(e.target.value)}
                  placeholder="e.g. Community Bonus Wheel"
                  className="bg-secondary/30 border-border/50"
                  data-ocid="admin.input"
                />
              </div>

              <div className="space-y-3">
                {spinSegments.map((seg, si) => (
                  <div
                    key={seg.id}
                    className="flex items-center gap-3 rounded-xl border border-border/40 bg-secondary/20 p-3"
                    data-ocid={`admin.item.${si + 1}`}
                  >
                    <div className="flex-1">
                      <Input
                        value={seg.segmentLabel}
                        onChange={(e) =>
                          updateSpinSegment(
                            seg.id,
                            "segmentLabel",
                            e.target.value,
                          )
                        }
                        placeholder={`Segment ${si + 1} label (e.g. 50 Points)`}
                        className="bg-secondary/30 border-border/50"
                        data-ocid="admin.input"
                      />
                    </div>
                    <div className="w-28">
                      <Input
                        type="number"
                        min={0}
                        value={seg.points}
                        onChange={(e) =>
                          updateSpinSegment(
                            seg.id,
                            "points",
                            Number(e.target.value),
                          )
                        }
                        placeholder="Points"
                        className="bg-secondary/30 border-border/50"
                        data-ocid="admin.input"
                      />
                    </div>
                    {spinSegments.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeSpinSegment(seg.id)}
                        className="text-destructive hover:opacity-70 transition-opacity shrink-0"
                        data-ocid={`admin.delete_button.${si + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSpinSegment}
                  className="rounded-full flex items-center gap-2"
                  data-ocid="admin.secondary_button"
                >
                  <Plus className="w-4 h-4" />
                  Add Segment
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateSpin}
                  disabled={createSpin.isPending}
                  className="gradient-bg border-0 text-white rounded-full glow-cyan flex items-center gap-2"
                  data-ocid="admin.primary_button"
                >
                  {createSpin.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  {createSpin.isPending ? "Creating..." : "Create Spin Wheel"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>

      <div>
        <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-primary" />
          Community Mini Games
        </h3>
        {loadingGames ? (
          <div className="space-y-2" data-ocid="admin.loading_state">
            {["g1", "g2"].map((k) => (
              <Skeleton key={k} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : !customGames || customGames.length === 0 ? (
          <div
            className="glass-card rounded-xl p-6 text-center text-muted-foreground text-sm"
            data-ocid="admin.empty_state"
          >
            No custom games yet. Create one above!
          </div>
        ) : (
          <div className="space-y-3">
            {customGames.map((g, gi) => (
              <div
                key={g.id.toString()}
                className="glass-card rounded-xl px-5 py-3 flex items-center justify-between"
                data-ocid={`admin.item.${gi + 1}`}
              >
                <div>
                  <p className="font-medium">{g.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {g.gameType.__kind__ === "customTrivia"
                      ? `Trivia \u00b7 ${g.gameType.customTrivia.questions.length} questions`
                      : `Spin Wheel \u00b7 ${g.gameType.customSpinWheel.segments.length} segments`}
                  </p>
                </div>
                <Badge
                  className={
                    g.gameType.__kind__ === "customTrivia"
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                      : "bg-purple-500/20 text-purple-400 border-purple-500/40"
                  }
                >
                  {g.gameType.__kind__ === "customTrivia"
                    ? "Trivia"
                    : "Spin Wheel"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ManagePlayerRanks() {
  const { data: allPoints, isLoading: loadingPoints } = useGetAllPlayerPoints();
  const { data: assignedRanks, isLoading: loadingRanks } =
    useGetAllAssignedRanks();
  const { ownerPrincipal } = useOwner();
  const assignRank = useAssignPlayerRank();

  // Local state: principal -> selected rank draft
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const assignedRankMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of assignedRanks ?? []) {
      if (e.rank) map.set(e.player.toString(), e.rank);
    }
    return map;
  }, [assignedRanks]);

  const sorted = useMemo(
    () =>
      [...(allPoints ?? [])].sort((a, b) =>
        b.points > a.points ? 1 : b.points < a.points ? -1 : 0,
      ),
    [allPoints],
  );

  function getDraft(principal: string): string {
    if (principal in drafts) return drafts[principal];
    return assignedRankMap.get(principal) ?? "";
  }

  async function handleSet(player: Principal, principal: string) {
    const rank = getDraft(principal);
    setSaving((prev) => ({ ...prev, [principal]: true }));
    try {
      await assignRank.mutateAsync({ player, rank });
      toast.success(
        rank
          ? `Rank set to ${rank} for ${principal.slice(0, 8)}...`
          : `Rank reset to auto for ${principal.slice(0, 8)}...`,
      );
      // Clear draft after save
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[principal];
        return next;
      });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to assign rank");
    } finally {
      setSaving((prev) => ({ ...prev, [principal]: false }));
    }
  }

  const isLoading = loadingPoints || loadingRanks;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl overflow-hidden border border-yellow-400/20"
      data-ocid="admin.rank_manager.panel"
    >
      <div className="px-6 py-4 border-b border-yellow-400/20 flex items-center gap-3 bg-yellow-400/5">
        <Shield className="w-5 h-5 text-yellow-400" />
        <h2 className="text-lg font-semibold text-yellow-400">
          Manage Player Ranks
        </h2>
        <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/40 text-xs">
          \ud83d\udc51 Owner Only
        </Badge>
      </div>

      <div className="px-6 py-5">
        <p className="text-sm text-muted-foreground mb-5">
          Override any player\u2019s rank badge. Select \u201cAuto\u201d to
          revert to points-based rank.
        </p>

        {isLoading ? (
          <div
            className="space-y-3"
            data-ocid="admin.rank_manager.loading_state"
          >
            {["r1", "r2", "r3"].map((k) => (
              <Skeleton key={k} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div
            className="text-center py-8 text-muted-foreground text-sm"
            data-ocid="admin.rank_manager.empty_state"
          >
            No players found.
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((entry, i) => {
              const principal = entry.player.toString();
              const points = Number(entry.points);
              const isEntryOwner = isOwnerPrincipal(
                ownerPrincipal,
                entry.player,
              );
              const currentAssigned = assignedRankMap.get(principal);
              const draftValue = getDraft(principal);
              const isSaving = saving[principal] ?? false;
              const shortPrincipal = `${principal.slice(0, 10)}...${principal.slice(-6)}`;

              return (
                <div
                  key={principal}
                  className="flex items-center gap-3 rounded-xl border border-border/30 bg-secondary/20 px-4 py-3"
                  data-ocid={`admin.rank_manager.item.${i + 1}`}
                >
                  {/* Player info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground truncate">
                        {shortPrincipal}
                      </span>
                      <RankBadge
                        points={points}
                        isOwner={isEntryOwner}
                        assignedRank={currentAssigned}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isEntryOwner ? "\u221e" : points.toLocaleString()} pts
                      {currentAssigned ? (
                        <span className="ml-2 text-yellow-400/70">
                          (override: {currentAssigned})
                        </span>
                      ) : null}
                    </p>
                  </div>

                  {/* Rank selector */}
                  <select
                    value={draftValue}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [principal]: e.target.value,
                      }))
                    }
                    className="rounded-lg border border-border/50 bg-secondary/40 px-2 py-1.5 text-xs text-foreground shrink-0 w-40"
                    data-ocid={`admin.rank_manager.select.${i + 1}`}
                  >
                    {RANK_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {RANK_LABELS[r]}
                      </option>
                    ))}
                  </select>

                  {/* Set button */}
                  <Button
                    size="sm"
                    onClick={() => handleSet(entry.player, principal)}
                    disabled={isSaving}
                    className="bg-yellow-400/20 border border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/30 rounded-full shrink-0 text-xs px-3"
                    data-ocid={`admin.rank_manager.save_button.${i + 1}`}
                  >
                    {isSaving ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "Set"
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function AdminPanel() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { actor } = useActor();
  const { data: myPoints, isLoading: loadingPoints } = useGetMyPoints();
  const { data: allPoints, isLoading: loadingAll } = useGetAllPlayerPoints();
  const myPrincipal = identity?.getPrincipal().toString();

  const [isCallerOwner, setIsCallerOwner] = useState(false);

  useEffect(() => {
    if (!actor || !identity) {
      setIsCallerOwner(false);
      return;
    }
    (actor as any)
      .isCallerOwner()
      .then(setIsCallerOwner)
      .catch(() => setIsCallerOwner(false));
  }, [actor, identity]);

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
          You are the #1 all-time points leader. View all quiz answers and
          create custom mini games.
        </p>
      </motion.div>

      {/* Quiz Answers Section */}
      <h2 className="text-xl font-semibold mb-4">All Quiz Answers</h2>
      {loadingAnswers ? (
        <div className="space-y-4 mb-10" data-ocid="admin.loading_state">
          {SKELETON_KEYS.map((k) => (
            <Skeleton key={k} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : !quizAnswers || quizAnswers.length === 0 ? (
        <div
          className="glass-card rounded-2xl p-12 text-center mb-10"
          data-ocid="admin.empty_state"
        >
          <p className="text-muted-foreground">No quizzes found.</p>
        </div>
      ) : (
        <div className="space-y-6 mb-10" data-ocid="admin.panel">
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

      {/* Mini Game Creator Section */}
      <h2 className="text-xl font-semibold mb-4">Mini Game Creator</h2>
      <MiniGameCreator />

      {/* Manage Player Ranks — Owner only */}
      {isCallerOwner && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400">Manage Player Ranks</span>
          </h2>
          <ManagePlayerRanks />
        </div>
      )}
    </div>
  );
}
