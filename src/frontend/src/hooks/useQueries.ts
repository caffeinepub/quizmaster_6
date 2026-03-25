import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Question, Quiz, Result, T, UserProfile } from "../backend.d";
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
