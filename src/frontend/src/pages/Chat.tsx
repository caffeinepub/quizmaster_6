import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "@tanstack/react-router";
import { MessageCircle, Send } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { isOwnerPrincipal, useOwner } from "../contexts/OwnerContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetMessages, useSendMessage } from "../hooks/useQueries";

function formatTime(timestampNs: bigint): string {
  const date = new Date(Number(timestampNs) / 1_000_000);
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function shortAuthor(author: { toString(): string }): string {
  return `${author.toString().slice(0, 8)}...`;
}

export default function Chat() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: messages } = useGetMessages();
  const { mutateAsync: sendMessage, isPending } = useSendMessage();
  const { ownerPrincipal } = useOwner();
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const myPrincipal = identity?.getPrincipal().toText();
  const msgCount = messages?.length ?? 0;

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgCount]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || !identity) return;
    setInput("");
    try {
      await sendMessage(content);
    } catch {
      setInput(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center glow-cyan">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Community Chat</h1>
            <p className="text-xs text-muted-foreground">
              {msgCount} messages · auto-refreshes every 5s
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl flex flex-col"
        style={{ height: "calc(100vh - 280px)", minHeight: "400px" }}
      >
        <ScrollArea className="flex-1 px-4 py-4">
          {!messages || messages.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-40 text-center"
              data-ocid="chat.empty_state"
            >
              <MessageCircle className="w-10 h-10 text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground text-sm">
                No messages yet. Be the first to say hi!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, i) => {
                const isMe = msg.author.toString() === myPrincipal;
                const authorIsOwner = isOwnerPrincipal(
                  ownerPrincipal,
                  msg.author,
                );
                const authorStr = msg.author.toString();
                return (
                  <motion.div
                    key={msg.id.toString()}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i < 10 ? i * 0.03 : 0 }}
                    className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                    data-ocid={`chat.item.${i + 1}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isMe
                          ? "gradient-bg text-white"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      {msg.author.toString().slice(0, 2).toUpperCase()}
                    </div>
                    <div
                      className={`max-w-[70%] ${
                        isMe ? "items-end" : "items-start"
                      } flex flex-col gap-0.5`}
                    >
                      <div
                        className={`flex items-center gap-2 ${
                          isMe ? "flex-row-reverse" : ""
                        }`}
                      >
                        {isMe ? (
                          <span className="text-xs text-muted-foreground font-medium">
                            You
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="text-xs text-muted-foreground font-medium hover:text-primary transition-colors cursor-pointer flex items-center gap-0.5"
                            onClick={() =>
                              navigate({
                                to: "/messages/$userId",
                                params: { userId: authorStr },
                              })
                            }
                            title="Send private message"
                            data-ocid={`chat.item.${i + 1}`}
                          >
                            {shortAuthor(msg.author)}
                            {authorIsOwner && <span>👑</span>}
                          </button>
                        )}
                        <span className="text-xs text-muted-foreground/60">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
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
          {identity ? (
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 rounded-full bg-secondary/40 border-border/40 focus:border-primary/60"
                disabled={isPending}
                maxLength={500}
                data-ocid="chat.input"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isPending}
                className="rounded-full gradient-bg border-0 text-white px-4 glow-cyan"
                data-ocid="chat.submit_button"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center py-2" data-ocid="chat.error_state">
              <p className="text-sm text-muted-foreground mb-2">
                Log in to chat
              </p>
              <Button
                onClick={login}
                disabled={loginStatus === "logging-in"}
                className="gradient-bg border-0 text-white rounded-full px-6 glow-cyan"
                data-ocid="chat.primary_button"
              >
                {loginStatus === "logging-in" ? "Connecting..." : "Log In"}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
