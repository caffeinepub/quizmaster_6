import { getRankFromAssigned } from "@/lib/ranks";

interface RankBadgeProps {
  points: number;
  isOwner?: boolean;
  assignedRank?: string;
  size?: "sm" | "md";
}

export function RankBadge({
  points,
  isOwner = false,
  assignedRank,
  size = "sm",
}: RankBadgeProps) {
  const rank = getRankFromAssigned(assignedRank, points, isOwner);
  const sizeClass =
    size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full font-semibold border ${sizeClass} ${rank.color} ${rank.bgColor} ${rank.borderColor} shrink-0`}
      title={`${rank.name} rank`}
    >
      <span>{rank.emoji}</span>
      <span>{rank.name}</span>
    </span>
  );
}
