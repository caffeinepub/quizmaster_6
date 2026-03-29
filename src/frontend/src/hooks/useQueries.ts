import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Comment,
  PointsEntry,
  PostWithStats,
  Question,
  Quiz,
  QuizWithAnswers,
  Result,
  T,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

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
  return useMutation<bigint, Error, { quizId: bigint; answers: T[] }>({
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
