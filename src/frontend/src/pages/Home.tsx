import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Database,
  Loader2,
  Play,
  Plus,
  Rss,
  Search,
  Share2,
  Sparkles,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import UsernameDialog from "../components/UsernameDialog";
import { useOwner } from "../contexts/OwnerContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreatePost,
  useDeleteQuiz,
  useGetAllQuizzes,
  useGetUserProfile,
  useSeedQuizzes,
} from "../hooks/useQueries";
import type { Quiz } from "../types";

const SKELETON_KEYS = [
  "sk-a",
  "sk-b",
  "sk-c",
  "sk-d",
  "sk-e",
  "sk-f",
  "sk-g",
  "sk-h",
];

export default function Home() {
  const [search, setSearch] = useState("");
  const { data: quizzes, isLoading } = useGetAllQuizzes();
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetUserProfile();
  const { isOwner } = useOwner();
  const seedMutation = useSeedQuizzes();

  const showUsernameDialog = !!identity && profile === null;

  const myPrincipal = identity?.getPrincipal().toString();

  const filtered = (quizzes ?? []).filter(
    (q) =>
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.description.toLowerCase().includes(search.toLowerCase()),
  );

  function handleSeedQuizzes() {
    seedMutation.mutate(undefined, {
      onSuccess: () => toast.success("Sample quizzes loaded!"),
      onError: () => toast.error("Failed to load sample quizzes."),
    });
  }

  return (
    <div className="relative overflow-hidden">
      {/* Decorative elements */}
      <div
        className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-10 animate-pulse_glow"
        style={{
          background:
            "radial-gradient(circle, oklch(0.73 0.14 215), transparent)",
        }}
      />
      <div
        className="absolute top-40 right-20 w-48 h-48 rounded-full opacity-10 animate-pulse_glow"
        style={{
          background:
            "radial-gradient(circle, oklch(0.56 0.20 290), transparent)",
          animationDelay: "1s",
        }}
      />
      <div className="absolute top-10 right-1/3 w-8 h-8 border-2 border-primary/30 rotate-45 animate-float" />
      <div
        className="absolute top-60 left-1/4 w-5 h-5 border-2 border-accent/30 rotate-12 animate-float"
        style={{ animationDelay: "0.5s" }}
      />

      {/* Hero */}
      <section className="container mx-auto px-4 pt-20 pb-16 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-6 gradient-bg border-0 text-white px-4 py-1.5 rounded-full">
            <Sparkles className="w-3 h-3 mr-1.5" />
            Over 100+ Quizzes Available
          </Badge>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            <span className="gradient-text">Test Your Knowledge.</span>
            <br />
            <span className="text-foreground">Challenge Friends.</span>
            <br />
            <span className="gradient-text">Create Fun!</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
            Join thousands of players exploring quizzes on every topic. Learn,
            compete, and become the ultimate quiz champion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button
                size="lg"
                className="gradient-bg border-0 text-white font-semibold rounded-full px-8 glow-cyan"
                data-ocid="hero.primary_button"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Quiz Now
              </Button>
            </Link>
            <Link to="/create">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 border-border text-foreground hover:bg-secondary"
                data-ocid="hero.secondary_button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your Own Quiz
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16"
        >
          {[
            {
              icon: BookOpen,
              label: "Quizzes",
              value: (quizzes?.length ?? 0).toString(),
            },
            { icon: Users, label: "Players", value: "1K+" },
            { icon: Trophy, label: "Top Scores", value: "500+" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card rounded-2xl p-4 text-center"
            >
              <stat.icon className="w-5 h-5 mx-auto mb-1 text-primary" />
              <div className="text-2xl font-bold gradient-text">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Quizzes section */}
      <section className="container mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold">Explore Quizzes</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search quizzes\u2026"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-secondary border-border rounded-full"
                data-ocid="quiz.search_input"
              />
            </div>
          </div>

          {isLoading ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
              data-ocid="quiz.loading_state"
            >
              {SKELETON_KEYS.map((key) => (
                <Skeleton key={key} className="h-64 rounded-2xl bg-secondary" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="text-center py-20 glass-card rounded-2xl"
              data-ocid="quiz.empty_state"
            >
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">No quizzes found.</p>
              <Link to="/create">
                <Button className="mt-4 gradient-bg border-0 text-white rounded-full">
                  Create the first quiz!
                </Button>
              </Link>
              {!!identity && (
                <Button
                  className="mt-3 rounded-full border-border"
                  variant="outline"
                  onClick={handleSeedQuizzes}
                  disabled={seedMutation.isPending}
                  data-ocid="quiz.secondary_button"
                >
                  {seedMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4 mr-2" />
                  )}
                  {seedMutation.isPending
                    ? "Loading quizzes\u2026"
                    : "Load Sample Quizzes"}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filtered.map((quiz, i) => {
                const canDelete =
                  isOwner ||
                  (!!myPrincipal && quiz.creator.toString() === myPrincipal);
                return (
                  <QuizCard
                    key={quiz.id.toString()}
                    quiz={quiz}
                    index={i + 1}
                    isCreator={
                      !!identity &&
                      identity.getPrincipal().toString() ===
                        quiz.creator.toString()
                    }
                    canDelete={canDelete}
                  />
                );
              })}
            </div>
          )}
        </motion.div>
      </section>

      <UsernameDialog open={showUsernameDialog} />
    </div>
  );
}

function QuizCard({
  quiz,
  index,
  isCreator,
  canDelete,
}: {
  quiz: Quiz;
  index: number;
  isCreator: boolean;
  canDelete: boolean;
}) {
  const navigate = useNavigate();
  const [postOpen, setPostOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [message, setMessage] = useState("");
  const createPost = useCreatePost();
  const deleteQuiz = useDeleteQuiz();

  const colors = [
    "from-blue-500 to-cyan-400",
    "from-purple-500 to-pink-400",
    "from-green-500 to-teal-400",
    "from-orange-500 to-yellow-400",
  ];
  const color = colors[(index - 1) % colors.length];

  function handlePost() {
    createPost.mutate(
      { quizId: quiz.id, message },
      {
        onSuccess: () => {
          setPostOpen(false);
          setMessage("");
          toast.success("Quiz posted to the feed!");
          navigate({ to: "/feed" });
        },
        onError: () => toast.error("Failed to post quiz."),
      },
    );
  }

  function handleDelete() {
    deleteQuiz.mutate(quiz.id, {
      onSuccess: () => {
        toast.success("Quiz deleted.");
        setDeleteOpen(false);
      },
      onError: (err) => toast.error(err.message ?? "Failed to delete quiz."),
    });
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="glass-card rounded-2xl overflow-hidden flex flex-col hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 relative"
        data-ocid={`quiz.item.${index}`}
      >
        <div
          className={`h-36 bg-gradient-to-br ${color} flex items-center justify-center relative`}
        >
          <BookOpen className="w-12 h-12 text-white/80" />
          {/* Delete button in card corner */}
          {canDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setDeleteOpen(true);
              }}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/30 hover:bg-destructive/80 text-white transition-colors"
              title="Delete quiz"
              data-ocid={`quiz.delete_button.${index}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-base mb-1 line-clamp-2">
            {quiz.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2 flex-1">
            {quiz.description}
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/quiz/$id" params={{ id: quiz.id.toString() }}>
              <Button
                size="sm"
                className="w-full gradient-bg border-0 text-white font-semibold rounded-full"
                data-ocid={`quiz.primary_button.${index}`}
              >
                <Play className="w-3.5 h-3.5 mr-1.5" />
                Play Quiz
              </Button>
            </Link>

            {isCreator && (
              <Dialog open={postOpen} onOpenChange={setPostOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full rounded-full border-border text-muted-foreground hover:text-foreground text-xs"
                    data-ocid={`quiz.open_modal_button.${index}`}
                  >
                    <Share2 className="w-3 h-3 mr-1.5" />
                    Post to Feed
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="sm:max-w-md"
                  data-ocid={`quiz.dialog.${index}`}
                >
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Rss className="w-4 h-4 text-primary" />
                      Post to Feed
                    </DialogTitle>
                    <DialogDescription>
                      Share <strong>{quiz.title}</strong> with the community.
                      Add an optional message.
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    placeholder="Add a message (optional)\u2026"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="bg-secondary border-border rounded-xl resize-none"
                    data-ocid={`quiz.textarea.${index}`}
                  />
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPostOpen(false)}
                      className="rounded-full"
                      data-ocid={`quiz.cancel_button.${index}`}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handlePost}
                      disabled={createPost.isPending}
                      className="gradient-bg border-0 text-white rounded-full"
                      data-ocid={`quiz.submit_button.${index}`}
                    >
                      {createPost.isPending ? (
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      ) : (
                        <Rss className="w-4 h-4 mr-1.5" />
                      )}
                      Post to Feed
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </motion.div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent data-ocid={`quiz.modal.${index}`}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-destructive" />
              Delete this quiz?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{quiz.title}</strong> will be permanently deleted. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid={`quiz.cancel_button.${index}`}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteQuiz.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid={`quiz.delete_button.${index}`}
            >
              {deleteQuiz.isPending ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1.5" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
