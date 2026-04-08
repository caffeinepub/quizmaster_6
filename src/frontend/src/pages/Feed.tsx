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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Heart,
  Loader2,
  MessageCircle,
  Play,
  Rss,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RankBadge } from "../components/RankBadge";
import { useOwner } from "../contexts/OwnerContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddComment,
  useDeleteQuiz,
  useGetAllPlayerPoints,
  useGetAllPosts,
  useGetAllQuizzes,
  useGetComments,
  useLikePost,
} from "../hooks/useQueries";
import type { PostWithStats, Quiz } from "../types";

const SKELETON_KEYS = ["sk-a", "sk-b", "sk-c"];

export default function Feed() {
  const { data: posts, isLoading } = useGetAllPosts();
  const { data: quizzes } = useGetAllQuizzes();
  const { identity } = useInternetIdentity();
  const { isOwner, ownerPrincipal } = useOwner();
  const { data: allPoints } = useGetAllPlayerPoints();

  const pointsMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of allPoints ?? []) {
      map.set(e.player.toString(), Number(e.points));
    }
    return map;
  }, [allPoints]);

  const myPrincipal = identity?.getPrincipal().toString();

  const quizMap = new Map<string, Quiz>();
  for (const q of quizzes ?? []) {
    quizMap.set(q.id.toString(), q);
  }

  const sorted = [...(posts ?? [])].sort((a, b) =>
    Number(b.post.timestamp - a.post.timestamp),
  );

  return (
    <div className="relative overflow-hidden">
      {/* Background glows */}
      <div
        className="absolute top-10 left-10 w-72 h-72 rounded-full opacity-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.73 0.14 215), transparent)",
        }}
      />
      <div
        className="absolute top-60 right-10 w-56 h-56 rounded-full opacity-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.56 0.20 290), transparent)",
        }}
      />

      <section className="container mx-auto px-4 pt-14 pb-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-5 gradient-bg border-0 text-white px-4 py-1.5 rounded-full">
            <Rss className="w-3 h-3 mr-1.5" />
            Social Quiz Feed
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="gradient-text">Discover & Share</span>
            <br />
            <span className="text-foreground">Quiz Posts</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto mb-6">
            See what quizzes the community is sharing. Like, comment, and jump
            in to play.
          </p>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 pb-20 max-w-2xl">
        {isLoading ? (
          <div className="space-y-5" data-ocid="feed.loading_state">
            {SKELETON_KEYS.map((k) => (
              <Skeleton key={k} className="h-56 rounded-2xl bg-secondary" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 glass-card rounded-2xl"
            data-ocid="feed.empty_state"
          >
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground text-lg mb-2">No posts yet!</p>
            <p className="text-muted-foreground text-sm mb-6">
              Be the first to share a quiz to the feed.
            </p>
            <Link to="/">
              <Button className="gradient-bg border-0 text-white rounded-full">
                Browse Quizzes
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-5">
            <AnimatePresence>
              {sorted.map((pws, i) => {
                const quiz = quizMap.get(pws.post.quizId.toString());
                const canDelete =
                  isOwner ||
                  (!!myPrincipal && quiz?.creator.toString() === myPrincipal);
                return (
                  <PostCard
                    key={pws.post.id.toString()}
                    pws={pws}
                    quiz={quiz}
                    index={i + 1}
                    isLoggedIn={!!identity}
                    canDelete={canDelete}
                    pointsMap={pointsMap}
                    ownerPrincipal={ownerPrincipal}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}

function PostCard({
  pws,
  quiz,
  index,
  isLoggedIn,
  canDelete,
  pointsMap,
  ownerPrincipal,
}: {
  pws: PostWithStats;
  quiz: Quiz | undefined;
  index: number;
  isLoggedIn: boolean;
  canDelete: boolean;
  pointsMap: Map<string, number>;
  ownerPrincipal: { toString(): string } | null;
}) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const likePost = useLikePost();
  const addComment = useAddComment();
  const deleteQuiz = useDeleteQuiz();
  const { data: comments, isLoading: commentsLoading } = useGetComments(
    commentsOpen ? pws.post.id : BigInt(-1),
  );

  const authorStr = pws.post.author.toString();
  const shortAuthor =
    authorStr.length > 12
      ? `${authorStr.slice(0, 6)}\u2026${authorStr.slice(-4)}`
      : authorStr;

  const likeCount = liked ? Number(pws.likeCount) + 1 : Number(pws.likeCount);

  function handleLike() {
    if (!isLoggedIn) return;
    if (!liked) {
      likePost.mutate(pws.post.id);
      setLiked(true);
    }
  }

  function handleComment() {
    const text = commentText.trim();
    if (!text || !isLoggedIn) return;
    addComment.mutate(
      { postId: pws.post.id, content: text },
      { onSuccess: () => setCommentText("") },
    );
  }

  function handleDelete() {
    if (!quiz) return;
    deleteQuiz.mutate(quiz.id, {
      onSuccess: () => {
        toast.success("Quiz deleted.");
        setDeleteOpen(false);
      },
      onError: (err) => toast.error(err.message ?? "Failed to delete quiz."),
    });
  }

  const colorAccents = [
    "from-blue-500 to-cyan-400",
    "from-purple-500 to-pink-400",
    "from-green-500 to-teal-400",
    "from-orange-500 to-yellow-400",
  ];
  const accent = colorAccents[(index - 1) % colorAccents.length];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ delay: index * 0.04, duration: 0.4 }}
        className="glass-card rounded-2xl overflow-hidden"
        data-ocid={`feed.item.${index}`}
      >
        {/* Color strip */}
        <div className={`h-1.5 bg-gradient-to-r ${accent}`} />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9 shrink-0">
                <AvatarFallback
                  className={`bg-gradient-to-br ${accent} text-white text-xs font-bold`}
                >
                  {shortAuthor[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-semibold text-foreground">
                    {shortAuthor}
                  </p>
                  <RankBadge
                    points={pointsMap.get(authorStr) ?? 0}
                    isOwner={ownerPrincipal?.toString() === authorStr}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(
                    Number(pws.post.timestamp / BigInt(1_000_000)),
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs shrink-0">
                <BookOpen className="w-2.5 h-2.5 mr-1" />
                Quiz Post
              </Badge>
              {canDelete && quiz && (
                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Delete quiz"
                  data-ocid={`feed.delete_button.${index}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quiz info */}
          {quiz ? (
            <div className="mb-3">
              <h3 className="font-bold text-base mb-0.5 gradient-text">
                {quiz.title}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2">
                {quiz.description}
              </p>
            </div>
          ) : (
            <div className="mb-3">
              <p className="text-muted-foreground text-sm italic">
                Quiz not found
              </p>
            </div>
          )}

          {/* Post message */}
          {pws.post.message && (
            <p className="text-sm text-foreground/80 mb-4 border-l-2 border-primary/40 pl-3 italic">
              {pws.post.message}
            </p>
          )}

          {/* Actions row */}
          <div className="flex items-center gap-3 mt-2">
            {/* Like */}
            <button
              type="button"
              onClick={handleLike}
              disabled={!isLoggedIn || liked}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-all duration-200 ${
                liked
                  ? "bg-pink-500/20 text-pink-400"
                  : "hover:bg-pink-500/10 text-muted-foreground hover:text-pink-400"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              data-ocid={`feed.toggle.${index}`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              <span>{likeCount}</span>
            </button>

            {/* Comments toggle */}
            <button
              type="button"
              onClick={() => setCommentsOpen((v) => !v)}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-200"
              data-ocid={`feed.secondary_button.${index}`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{Number(pws.commentCount)}</span>
              {commentsOpen ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Play button */}
            {quiz && (
              <Link to="/quiz/$id" params={{ id: pws.post.quizId.toString() }}>
                <Button
                  size="sm"
                  className="gradient-bg border-0 text-white font-semibold rounded-full text-xs px-4"
                  data-ocid={`feed.primary_button.${index}`}
                >
                  <Play className="w-3 h-3 mr-1.5" />
                  Play Quiz
                </Button>
              </Link>
            )}
          </div>

          {/* Comments section */}
          <AnimatePresence>
            {commentsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-border">
                  {commentsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 rounded-lg bg-secondary" />
                      <Skeleton className="h-8 rounded-lg bg-secondary" />
                    </div>
                  ) : (comments ?? []).length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-2">
                      No comments yet. Be the first!
                    </p>
                  ) : (
                    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
                      {(comments ?? []).map((c) => {
                        const cAuthor = c.author.toString();
                        const shortC =
                          cAuthor.length > 12
                            ? `${cAuthor.slice(0, 6)}\u2026${cAuthor.slice(-4)}`
                            : cAuthor;
                        return (
                          <div key={c.id.toString()} className="flex gap-2.5">
                            <Avatar className="w-6 h-6 shrink-0 mt-0.5">
                              <AvatarFallback className="gradient-bg text-white text-xs">
                                {shortC[0]?.toUpperCase() ?? "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <span className="text-xs font-medium text-foreground/80">
                                {shortC}{" "}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {c.content}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {isLoggedIn && (
                    <div className="flex gap-2 mt-3">
                      <Textarea
                        placeholder="Write a comment\u2026"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        rows={2}
                        className="flex-1 bg-secondary border-border rounded-xl text-sm resize-none"
                        data-ocid={`feed.textarea.${index}`}
                      />
                      <Button
                        size="sm"
                        onClick={handleComment}
                        disabled={!commentText.trim() || addComment.isPending}
                        className="gradient-bg border-0 text-white rounded-xl self-end px-3"
                        data-ocid={`feed.submit_button.${index}`}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {!isLoggedIn && (
                    <p className="text-muted-foreground text-xs text-center mt-2">
                      Log in to like and comment.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent data-ocid={`feed.dialog.${index}`}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-destructive" />
              Delete this quiz?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{quiz?.title}</strong> will be permanently deleted. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid={`feed.cancel_button.${index}`}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteQuiz.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid={`feed.delete_button.${index}`}
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
