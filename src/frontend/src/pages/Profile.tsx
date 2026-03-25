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
import { BookOpen, Check, Edit2, Loader2, Trophy, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetUserProfile,
  useGetUserQuizResults,
  useUpdateUserProfile,
} from "../hooks/useQueries";

export default function Profile() {
  const { identity, login } = useInternetIdentity();
  const { data: profile } = useGetUserProfile();
  const { data: results, isLoading: loadingResults } = useGetUserQuizResults();
  const updateProfile = useUpdateUserProfile();

  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");

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
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">
                  {profile?.username ?? "Loading..."}
                </h1>
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
            </div>
          </div>
        </div>

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
    </div>
  );
}
