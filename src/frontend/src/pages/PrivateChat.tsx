import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Principal } from "@icp-sdk/core/principal";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { BannedBanner } from "../components/BannedBanner";
import { useBanStatus } from "../contexts/BanContext";
import { isOwnerPrincipal, useOwner } from "../contexts/OwnerContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetConversation } from "../hooks/useQueries";

function formatTime(ns: bigint): string {
  const date = new Date(Number(ns) / 1_000_000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function shortP(p: { toString(): string }): string {
  const s = p.toString();
  return `${s.slice(0, 8)}...${s.slice(-5)}`;
}

export default function PrivateChat() {
  const { userId } = useParams({ strict: false }) as { userId: string };
  const { identity, login } = useInternetIdentity();
  const { actor } = useActor();
  const { ownerPrincipal } = useOwner();

  const otherUser = useMemo(() => {
    try {
      return Principal.fromText(userId);
    } catch {
      return null;
    }
  }, [userId]);

  const { data: messages, isLoading } = useGetConversation(otherUser);
  const { isBanned } = useBanStatus();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const myPrincipal = identity?.getPrincipal().toString();

  // Mark as read on mount and when messages change
  useEffect(() => {
    if (actor && otherUser) {
      (actor as any).markConversationRead(otherUser).catch(() => {});
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: mark read when conversation loads
  }, [actor, otherUser]);

  // Auto scroll
  const msgCount = messages?.length ?? 0;
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message count change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgCount]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || !actor || !otherUser || !identity || isBanned) return;
    setSending(true);
    setInput("");
    try {
      await (actor as any).sendPrivateMessage(otherUser, content);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to send");
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-muted-foreground mb-6">Log in to view messages.</p>
        <Button
          onClick={login}
          className="gradient-bg border-0 text-white rounded-full px-8"
          data-ocid="private_chat.primary_button"
        >
          Log In
        </Button>
      </div>
    );
  }

  const otherIsOwner = isOwnerPrincipal(ownerPrincipal, otherUser);
  const otherDisplayName = otherUser ? shortP(otherUser) : "Unknown";

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-4"
      >
        <Link
          to="/messages"
          className="p-2 rounded-full hover:bg-secondary/60 transition-colors"
          data-ocid="private_chat.link"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Avatar className="w-9 h-9">
          <AvatarFallback className="bg-secondary text-foreground font-bold text-xs">
            {otherDisplayName[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold flex items-center gap-1.5">
            {otherDisplayName}
            {otherIsOwner && <span title="Owner">👑</span>}
          </div>
          <p className="text-xs text-muted-foreground">Private conversation</p>
        </div>
      </motion.div>

      {/* Chat area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl flex flex-col"
        style={{ height: "calc(100vh - 260px)", minHeight: "400px" }}
        data-ocid="private_chat.panel"
      >
        <ScrollArea className="flex-1 px-4 py-4">
          {isLoading ? (
            <div className="space-y-3" data-ocid="private_chat.loading_state">
              {["a", "b", "c"].map((k) => (
                <Skeleton key={k} className="h-10 rounded-xl" />
              ))}
            </div>
          ) : !messages || messages.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-40 text-center"
              data-ocid="private_chat.empty_state"
            >
              <p className="text-muted-foreground text-sm">
                No messages yet. Say hello!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, i) => {
                const isMe = msg.sender.toString() === myPrincipal;
                return (
                  <motion.div
                    key={msg.id.toString()}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i < 10 ? i * 0.03 : 0 }}
                    className={`flex gap-2 ${
                      isMe ? "flex-row-reverse" : "flex-row"
                    }`}
                    data-ocid={`private_chat.item.${i + 1}`}
                  >
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarFallback
                        className={`text-xs font-bold ${
                          isMe
                            ? "gradient-bg text-white"
                            : "bg-secondary text-foreground"
                        }`}
                      >
                        {isMe ? "Y" : otherDisplayName[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-[70%] flex flex-col gap-0.5 ${
                        isMe ? "items-end" : "items-start"
                      }`}
                    >
                      <span className="text-xs text-muted-foreground">
                        {formatTime(msg.timestamp)}
                      </span>
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm ${
                          isMe
                            ? "gradient-bg text-white rounded-tr-sm"
                            : "bg-secondary/60 text-foreground rounded-tl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-border/40 p-3">
          {isBanned ? (
            <BannedBanner />
          ) : (
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 rounded-full bg-secondary/40 border-border/40 focus:border-primary/60"
                disabled={sending}
                maxLength={1000}
                data-ocid="private_chat.input"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="rounded-full gradient-bg border-0 text-white px-4 glow-cyan"
                data-ocid="private_chat.submit_button"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
