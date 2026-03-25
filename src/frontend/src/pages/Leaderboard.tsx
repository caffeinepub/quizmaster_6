import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Loader2, Medal, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useGetLeaderboard, useGetQuiz } from "../hooks/useQueries";

const rankColors = ["text-yellow-400", "text-gray-400", "text-amber-600"];
const rankIcons = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const { id } = useParams({ from: "/quiz/$id/leaderboard" });
  const quizId = BigInt(id);
  const { data: quiz } = useGetQuiz(quizId);
  const { data: entries, isLoading } = useGetLeaderboard(quizId);

  const sorted = entries
    ? [...entries].sort((a, b) => Number(b.score) - Number(a.score))
    : [];

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-10">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
          <h1 className="text-3xl font-extrabold gradient-text">Leaderboard</h1>
          {quiz && <p className="text-muted-foreground mt-1">{quiz.title}</p>}
        </div>

        {/* Top 3 cards */}
        {sorted.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-10">
            {sorted.slice(0, 3).map((entry, i) => (
              <motion.div
                key={entry.player.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card rounded-2xl p-5 text-center ${
                  i === 0 ? "ring-2 ring-yellow-400/50" : ""
                }`}
                data-ocid={`leaderboard.item.${i + 1}`}
              >
                <div className="text-3xl mb-2">{rankIcons[i]}</div>
                <Avatar className="w-10 h-10 mx-auto mb-2">
                  <AvatarFallback className="gradient-bg text-white text-sm">
                    {entry.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="font-semibold text-sm">{entry.username}</div>
                <div className={`font-bold text-lg ${rankColors[i]}`}>
                  {Number(entry.score)}/{Number(entry.totalQuestions)}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Full table */}
        <div
          className="glass-card rounded-2xl overflow-hidden"
          data-ocid="leaderboard.table"
        >
          {isLoading ? (
            <div
              className="flex items-center justify-center py-16"
              data-ocid="leaderboard.loading_state"
            >
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : sorted.length === 0 ? (
            <div
              className="text-center py-16 text-muted-foreground"
              data-ocid="leaderboard.empty_state"
            >
              No scores yet. Be the first to play!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Rank</TableHead>
                  <TableHead className="text-muted-foreground">
                    Player
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
                {sorted.map((entry, i) => (
                  <TableRow
                    key={entry.player.toString()}
                    className="border-border"
                    data-ocid={`leaderboard.row.${i + 1}`}
                  >
                    <TableCell>
                      {i < 3 ? (
                        <span className={`font-bold ${rankColors[i]}`}>
                          {rankIcons[i]}
                        </span>
                      ) : (
                        <span className="text-muted-foreground font-semibold">
                          #{i + 1}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className="gradient-bg text-white text-xs">
                            {entry.username[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{entry.username}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      <span className="gradient-text">
                        {Number(entry.score)}/{Number(entry.totalQuestions)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {new Date(
                        Number(entry.timestamp) / 1_000_000,
                      ).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link to="/">
            <Button
              variant="outline"
              className="rounded-full border-border"
              data-ocid="leaderboard.secondary_button"
            >
              Back to Quizzes
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
