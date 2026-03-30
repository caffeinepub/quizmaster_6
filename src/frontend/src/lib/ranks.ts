export type RankName = "Noob" | "Pro" | "God" | "Hacker" | "Admin" | "Owner";

export interface RankInfo {
  name: RankName;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const RANK_MAP: Record<string, RankInfo> = {
  Owner: {
    name: "Owner",
    emoji: "\ud83d\udc51",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/20",
    borderColor: "border-yellow-400/40",
  },
  Admin: {
    name: "Admin",
    emoji: "\u26a1",
    color: "text-orange-400",
    bgColor: "bg-orange-400/20",
    borderColor: "border-orange-400/40",
  },
  Hacker: {
    name: "Hacker",
    emoji: "\ud83d\udc80",
    color: "text-green-400",
    bgColor: "bg-green-400/20",
    borderColor: "border-green-400/40",
  },
  God: {
    name: "God",
    emoji: "\u2728",
    color: "text-purple-400",
    bgColor: "bg-purple-400/20",
    borderColor: "border-purple-400/40",
  },
  Pro: {
    name: "Pro",
    emoji: "\u2b50",
    color: "text-blue-400",
    bgColor: "bg-blue-400/20",
    borderColor: "border-blue-400/40",
  },
  Noob: {
    name: "Noob",
    emoji: "\ud83c\udf31",
    color: "text-gray-400",
    bgColor: "bg-gray-400/20",
    borderColor: "border-gray-400/40",
  },
};

export function getRank(points: number, isOwner: boolean): RankInfo {
  if (isOwner) return RANK_MAP.Owner;
  if (points >= 2_000_000) return RANK_MAP.Admin;
  if (points >= 100_000) return RANK_MAP.Hacker;
  if (points >= 2_000) return RANK_MAP.God;
  if (points >= 500) return RANK_MAP.Pro;
  return RANK_MAP.Noob;
}

export function getRankFromAssigned(
  assignedRank: string | null | undefined,
  points: number,
  isOwner: boolean,
): RankInfo {
  if (assignedRank && assignedRank in RANK_MAP) {
    return RANK_MAP[assignedRank];
  }
  return getRank(points, isOwner);
}
