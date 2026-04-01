import { ShieldOff } from "lucide-react";

export function BannedBanner() {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-400 text-sm"
      data-ocid="banned.error_state"
    >
      <ShieldOff className="w-4 h-4 shrink-0" />
      <span>You are banned. You cannot participate in this activity.</span>
    </div>
  );
}
