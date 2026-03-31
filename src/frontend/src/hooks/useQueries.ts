import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Answer,
  Comment,
  ConversationSummary,
  CustomGame,
  CustomTriviaQuestion,
  PointsEntry,
  PostWithStats,
  PrivateMessage,
  Question,
  Quiz,
  QuizWithAnswers,
  Result,
  SpinWheelSegment,
  UserProfile,
} from "../backend.d";
import { seedQuizzes } from "../data/seedData";
import { useActor } from "./useActor";

export interface ChatMessage {
  id: bigint;
  author: { toString(): string };
  content: string;
  timestamp: bigint;
}

export interface PointPackage {
  id: bigint;
  name: string;
  points: bigint;
  priceInPaise: bigint;
}

export function useGetAllQuizzes() {
  const { actor, isFetching } = useActor();
  return useQuery<Quiz[]>({
    queryKey: ["quizzes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllQuizzes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetQuiz(quizId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Quiz>({
    queryKey: ["quiz", quizId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getQuiz(quizId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetQuizQuestions(quizId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Question[]>({
    queryKey: ["questions", quizId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getQuizQuestions(quizId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLeaderboard(quizId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Result[] | null>({
    queryKey: ["leaderboard", quizId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getQuizLeaderboard(quizId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserQuizResults() {
  const { actor, isFetching } = useActor();
  return useQuery<Result[]>({
    queryKey: ["userResults"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserQuizResults();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateQuiz() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<bigint, Error, { title: string; description: string }>({
    mutationFn: async ({ title, description }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createQuiz(title, description);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quizzes"] }),
  });
}

export function useAddQuestion() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<bigint, Error, { quizId: bigint; question: Question }>({
    mutationFn: async ({ quizId, question }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.addQuestion(quizId, question);
    },
    onSuccess: (_, { quizId }) =>
      qc.invalidateQueries({ queryKey: ["questions", quizId.toString()] }),
  });
}

export function useSubmitQuizAnswers() {
  const { actor } = useActor();
  return useMutation<bigint, Error, { quizId: bigint; answers: Answer[] }>({
    mutationFn: async ({ quizId, answers }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.submitQuizAnswers(quizId, answers);
    },
  });
}

export function useCreateUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (username) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createUserProfile(username);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userProfile"] }),
  });
}

export function useUpdateUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (username) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateUserProfile(username);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userProfile"] }),
  });
}

// Social feed hooks
export function useGetAllPosts() {
  const { actor, isFetching } = useActor();
  return useQuery<PostWithStats[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPostsWithStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetComments(postId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Comment[]>({
    queryKey: ["comments", postId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCommentsByPostId(postId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<void, Error, bigint>({
    mutationFn: async (postId) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.likePost(postId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

export function useUnlikePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<void, Error, bigint>({
    mutationFn: async (postId) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.unlikePost(postId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<bigint, Error, { postId: bigint; content: string }>({
    mutationFn: async ({ postId, content }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.addComment(postId, content);
    },
    onSuccess: (_, { postId }) =>
      qc.invalidateQueries({ queryKey: ["comments", postId.toString()] }),
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<bigint, Error, { quizId: bigint; message: string }>({
    mutationFn: async ({ quizId, message }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createPost(quizId, message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

// Mini-game / points hooks
export function useGetMyPoints() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["myPoints"],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getMyPoints();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllPlayerPoints() {
  const { actor, isFetching } = useActor();
  return useQuery<PointsEntry[]>({
    queryKey: ["allPlayerPoints"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPlayerPoints();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAwardPoints() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<void, Error, bigint>({
    mutationFn: async (amount) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.awardPoints(amount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myPoints"] });
      qc.invalidateQueries({ queryKey: ["allPlayerPoints"] });
    },
  });
}

export function useGetAdminQuizAnswers(enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<QuizWithAnswers[]>({
    queryKey: ["adminQuizAnswers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdminQuizAnswers();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useGetAllCustomGames() {
  const { actor, isFetching } = useActor();
  return useQuery<CustomGame[]>({
    queryKey: ["customGames"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCustomGames();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCustomTrivia() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<
    bigint,
    Error,
    { title: string; questions: CustomTriviaQuestion[] }
  >({
    mutationFn: async ({ title, questions }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createCustomTrivia(title, questions);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customGames"] }),
  });
}

export function useCreateCustomSpinWheel() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<
    bigint,
    Error,
    { title: string; segments: SpinWheelSegment[] }
  >({
    mutationFn: async ({ title, segments }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createCustomSpinWheel(title, segments);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customGames"] }),
  });
}

export function useSeedQuizzes() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("Not authenticated");
      for (const seedQuiz of seedQuizzes) {
        const quizId = await actor.createQuiz(
          seedQuiz.title,
          seedQuiz.description,
        );
        for (const q of seedQuiz.questions) {
          const question: Question = {
            id: 0n,
            text: q.text,
            questionType: {
              __kind__: "trueFalse",
              trueFalse: { correctAnswer: q.correctAnswer },
            },
            quizId: 0n,
          };
          await actor.addQuestion(quizId, question);
        }
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quizzes"] }),
  });
}

export function useDeleteQuiz() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<void, Error, bigint>({
    mutationFn: async (quizId) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).deleteQuiz(quizId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quizzes"] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

// Chat hooks
export function useGetMessages() {
  const { actor, isFetching } = useActor();
  return useQuery<ChatMessage[]>({
    queryKey: ["chatMessages"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getMessages();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<bigint, Error, string>({
    mutationFn: async (content) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).sendMessage(content);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chatMessages"] }),
  });
}

export function usePlayCustomSpinWheel() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<bigint, Error, bigint>({
    mutationFn: async (gameId) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.playCustomSpinWheel(gameId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myPoints"] });
      qc.invalidateQueries({ queryKey: ["allPlayerPoints"] });
    },
  });
}

export function usePlayCustomTrivia() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<
    bigint,
    Error,
    {
      gameId: bigint;
      answers: Array<{ questionId: bigint; answerIndex: bigint }>;
    }
  >({
    mutationFn: async ({ gameId, answers }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.playCustomTrivia(gameId, answers);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myPoints"] });
      qc.invalidateQueries({ queryKey: ["allPlayerPoints"] });
    },
  });
}

// Private messaging hooks
export function useGetMyConversations() {
  const { actor, isFetching } = useActor();
  return useQuery<ConversationSummary[]>({
    queryKey: ["myConversations"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getMyConversations() as Promise<
        ConversationSummary[]
      >;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useGetConversation(otherUser: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<PrivateMessage[]>({
    queryKey: ["conversation", otherUser?.toString() ?? ""],
    queryFn: async () => {
      if (!actor || !otherUser) return [];
      return (actor as any).getConversation(otherUser) as Promise<
        PrivateMessage[]
      >;
    },
    enabled: !!actor && !isFetching && !!otherUser,
    refetchInterval: 3000,
  });
}

export function useGetUnreadMessageCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["unreadMessages"],
    queryFn: async () => {
      if (!actor) return 0n;
      return (actor as any).getUnreadMessageCount() as Promise<bigint>;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useGiftPoints() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<void, Error, { recipient: Principal; amount: bigint }>({
    mutationFn: async ({ recipient, amount }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.giftPoints(recipient, amount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myPoints"] });
      qc.invalidateQueries({ queryKey: ["allPlayerPoints"] });
    },
  });
}

export interface PlayerRankEntry {
  player: { toString(): string };
  rank: string;
}

export function useGetAllAssignedRanks() {
  const { actor, isFetching } = useActor();
  return useQuery<PlayerRankEntry[]>({
    queryKey: ["assignedRanks"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllAssignedRanks() as Promise<PlayerRankEntry[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignPlayerRank() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<
    void,
    Error,
    { player: import("@icp-sdk/core/principal").Principal; rank: string }
  >({
    mutationFn: async ({ player, rank }) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).assignPlayerRank(player, rank);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignedRanks"] }),
  });
}

// Buy Points hooks
export function useGetPointPackages() {
  const { actor, isFetching } = useActor();
  return useQuery<PointPackage[]>({
    queryKey: ["pointPackages"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getPointPackages() as Promise<PointPackage[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyMonthlySpend() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["myMonthlySpend"],
    queryFn: async () => {
      if (!actor) return 0n;
      return (actor as any).getMyMonthlySpend() as Promise<bigint>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMonthlyLimit() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["monthlyLimit"],
    queryFn: async () => {
      if (!actor) return 1_000_000n;
      return (actor as any).getMonthlyLimit() as Promise<bigint>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFulfillPointsPurchase() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<bigint, Error, { packageId: bigint; sessionId: string }>({
    mutationFn: async ({ packageId, sessionId }) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).fulfillPointsPurchase(
        packageId,
        sessionId,
      ) as Promise<bigint>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myPoints"] });
      qc.invalidateQueries({ queryKey: ["allPlayerPoints"] });
      qc.invalidateQueries({ queryKey: ["myMonthlySpend"] });
    },
  });
}
