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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Check,
  Crown,
  Edit2,
  Loader2,
  Play,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useOwner } from "../contexts/OwnerContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeleteQuiz,
  useGetAllQuizzes,
  useGetUserProfile,
  useGetUserQuizResults,
  useUpdateUserProfile,
} from "../hooks/useQueries";

export default function Profile() {
  const { identity, login } = useInternetIdentity();
  const { data: profile } = useGetUserProfile();
  const { data: results, isLoading: loadingResults } = useGetUserQuizResults();
  const { data: allQuizzes } = useGetAllQuizzes();
  const updateProfile = useUpdateUserProfile();
  const deleteQuiz = useDeleteQuiz();
  const { isOwner, ownerPrincipal, claimOwnership, isLoadingOwner } =
    useOwner();

  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: bigint;
    title: string;
  } | null>(null);

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Login Required</h2>
        <p className="text-muted-foreground mb-6">
          Log in to view your profile.
        </p>
        <Button
          onClick={login}
          className="gradient-bg border-0 text-white rounded-full px-8"
          data-ocid="profile.primary_button"
        >
          Log In
        </Button>
      </div>
    );
  }

  const myPrincipal = identity.getPrincipal().toString();

  const myQuizzes = (allQuizzes ?? []).filter(
    (q) => q.creator.toString() === myPrincipal,
  );

  const startEditing = () => {
    setNewUsername(profile?.username ?? "");
    setEditing(true);
  };

  const saveUsername = async () => {
    if (!newUsername.trim()) return;
    try {
      await updateProfile.mutateAsync(newUsername.trim());
      setEditing(false);
      toast.success("Username updated!");
    } catch {
      toast.error("Failed to update username.");
    }
  };

  const handleClaimOwnership = async () => {
    setClaiming(true);
    try {
      await claimOwnership();
      toast.success("👑 You are now the Owner! You have infinite points.");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to claim ownership");
    } finally {
      setClaiming(false);
    }
  };

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteQuiz.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Quiz deleted.");
        setDeleteTarget(null);
      },
      onError: (err) => toast.error(err.message ?? "Failed to delete quiz."),
    });
  }

  const noOwnerYet = !isLoadingOwner && ownerPrincipal === null;

  const sortedResults = results
    ? [...results].sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    : [];

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Profile card */}
        <div className="glass-card rounded-2xl p-8 flex items-center gap-6">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="gradient-bg text-white text-3xl">
              {profile?.username?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            {editing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="bg-secondary border-border max-w-xs"
                  data-ocid="profile.input"
                />
                <Button
                  size="icon"
                  onClick={saveUsername}
                  disabled={updateProfile.isPending}
                  className="gradient-bg border-0"
                  data-ocid="profile.save_button"
                >
                  {updateProfile.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 text-white" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setEditing(false)}
                  data-ocid="profile.cancel_button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">
                  {profile?.username ?? "Loading..."}
                </h1>
                {isOwner && (
                  <span
                    className="flex items-center gap-1 text-yellow-400 font-semibold text-sm"
                    title="Owner rank — infinite points"
                  >
                    <Crown className="w-4 h-4" />
                    Owner
                  </span>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={startEditing}
                  data-ocid="profile.edit_button"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            <p className="text-muted-foreground text-sm mt-1">
              {identity.getPrincipal().toString().slice(0, 20)}...
            </p>
            <div className="flex gap-4 mt-3">
              <div className="text-sm">
                <span className="font-bold text-primary">
                  {sortedResults.length}
                </span>
                <span className="text-muted-foreground ml-1">
                  quizzes played
                </span>
              </div>
              <div className="text-sm">
                <span className="font-bold text-primary">
                  {myQuizzes.length}
                </span>
                <span className="text-muted-foreground ml-1">
                  quizzes created
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Claim Owner section */}
        {noOwnerYet && !isOwner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-6 border border-yellow-400/20"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center shrink-0">
                <Crown className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                  Claim Owner Rank
                  <span className="text-yellow-400">👑</span>
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  No owner has been claimed yet. The first person to claim
                  ownership gets the <strong>Owner</strong> rank — unlimited
                  points and the ability to gift points freely to anyone.
                </p>
                <Button
                  onClick={handleClaimOwnership}
                  disabled={claiming}
                  className="bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-400 border border-yellow-400/40 rounded-full px-6"
                  data-ocid="profile.primary_button"
                >
                  {claiming ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      Claim Owner
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* My Quizzes */}
        {myQuizzes.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              My Quizzes
            </h2>
            <div className="glass-card rounded-2xl overflow-hidden divide-y divide-border/40">
              {myQuizzes.map((quiz, i) => (
                <div
                  key={quiz.id.toString()}
                  className="flex items-center gap-3 px-5 py-4"
                  data-ocid={`profile.quiz.item.${i + 1}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{quiz.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {quiz.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link to="/quiz/$id" params={{ id: quiz.id.toString() }}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full border-primary/40 text-primary hover:bg-primary/10"
                        data-ocid={`profile.quiz.primary_button.${i + 1}`}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Play
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() =>
                        setDeleteTarget({ id: quiz.id, title: quiz.title })
                      }
                      data-ocid={`profile.quiz.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quiz history */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Quiz History
          </h2>
          <div className="glass-card rounded-2xl overflow-hidden">
            {loadingResults ? (
              <div
                className="flex items-center justify-center py-12"
                data-ocid="profile.loading_state"
              >
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : sortedResults.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="profile.empty_state"
              >
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
                No quizzes played yet. Go play your first quiz!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">
                      Quiz
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Score
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedResults.map((r, i) => (
                    <TableRow
                      key={`${r.quizId.toString()}-${r.timestamp.toString()}`}
                      className="border-border"
                      data-ocid={`history.row.${i + 1}`}
                    >
                      <TableCell className="font-medium">
                        Quiz #{Number(r.quizId)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="gradient-text font-bold">
                          {Number(r.score)}/{Number(r.totalQuestions)}
                        </span>
                        <span className="text-muted-foreground text-xs ml-2">
                          (
                          {Math.round(
                            (Number(r.score) / Number(r.totalQuestions)) * 100,
                          )}
                          %)
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {new Date(
                          Number(r.timestamp) / 1_000_000,
                        ).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </motion.div>

      {/* Delete Quiz confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="profile.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-destructive" />
              Delete this quiz?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.title}</strong> will be permanently
              deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteTarget(null)}
              data-ocid="profile.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteQuiz.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="profile.delete_button"
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
    </div>
  );
}
