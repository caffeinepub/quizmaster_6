import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import type { Principal } from "@icp-sdk/core/principal";
import { Link, useNavigate } from "@tanstack/react-router";
import { MessageSquare, Search, Users } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { isOwnerPrincipal, useOwner } from "../contexts/OwnerContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetMyConversations } from "../hooks/useQueries";

function formatTimeAgo(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function PrivateMessages() {
  const { identity, login } = useInternetIdentity();
  const { actor } = useActor();
  const navigate = useNavigate();
  const { data: conversations, isLoading } = useGetMyConversations();
  const { ownerPrincipal } = useOwner();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<[Principal, { username: string }]>
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim() || !actor) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await (actor as any).searchUsers(searchQuery.trim());
        setSearchResults(results as Array<[Principal, { username: string }]>);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, actor]);

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <MessageSquare className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-3">Private Messages</h2>
        <p className="text-muted-foreground mb-6">
          Log in to view your messages.
        </p>
        <Button
          onClick={login}
          className="gradient-bg border-0 text-white rounded-full px-8"
          data-ocid="messages.primary_button"
        >
          Log In
        </Button>
      </div>
    );
  }

  const myPrincipal = identity.getPrincipal().toString();

  const goToChat = (userId: string) => {
    navigate({ to: "/messages/$userId", params: { userId } });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center glow-cyan">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Messages</h1>
            <p className="text-xs text-muted-foreground">
              Private conversations
            </p>
          </div>
        </div>

        {/* Find Player Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find a player to message..."
            className="pl-9 rounded-full bg-secondary/40 border-border/40"
            data-ocid="messages.search_input"
          />
          {searchQuery.trim() && (isSearching || searchResults.length > 0) && (
            <div
              className="absolute top-full left-0 right-0 mt-1 glass-card rounded-xl overflow-hidden z-10 border border-border/40"
              data-ocid="messages.popover"
            >
              {isSearching ? (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  Searching...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  No players found
                </div>
              ) : (
                searchResults
                  .filter(([p]) => p.toString() !== myPrincipal)
                  .map(([principal, profile]) => {
                    const pStr = principal.toString();
                    const isOwner = isOwnerPrincipal(ownerPrincipal, principal);
                    return (
                      <button
                        key={pStr}
                        type="button"
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/40 transition-colors text-left"
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResults([]);
                          goToChat(pStr);
                        }}
                        data-ocid="messages.item.1"
                      >
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarFallback className="gradient-bg text-white text-xs">
                            {profile.username[0]?.toUpperCase() ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm flex items-center gap-1">
                            {profile.username}
                            {isOwner && <span title="Owner">👑</span>}
                          </span>
                          <span className="text-xs text-muted-foreground truncate block">
                            {pStr.slice(0, 12)}...
                          </span>
                        </div>
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      </button>
                    );
                  })
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Conversations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl overflow-hidden"
        data-ocid="messages.list"
      >
        {isLoading ? (
          <div className="p-4 space-y-3" data-ocid="messages.loading_state">
            {["a", "b", "c"].map((k) => (
              <Skeleton key={k} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : !conversations || conversations.length === 0 ? (
          <div className="p-12 text-center" data-ocid="messages.empty_state">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No conversations yet.</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Search for a player above to start chatting.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="divide-y divide-border/40">
              {conversations.map((conv, i) => {
                const pStr = conv.otherUser.toString();
                const isOwner = isOwnerPrincipal(
                  ownerPrincipal,
                  conv.otherUser,
                );
                const shortName = `${pStr.slice(0, 8)}...${pStr.slice(-5)}`;
                return (
                  <Link
                    key={pStr}
                    to="/messages/$userId"
                    params={{ userId: pStr }}
                    className="flex items-center gap-3 px-4 py-4 hover:bg-secondary/30 transition-colors"
                    data-ocid={`messages.item.${i + 1}`}
                  >
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback className="bg-secondary text-foreground font-bold">
                        {shortName[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-sm">{shortName}</span>
                        {isOwner && <span title="Owner">👑</span>}
                        {conv.unreadCount > 0n && (
                          <Badge className="bg-primary text-white text-xs px-1.5 py-0 h-4 min-w-4">
                            {conv.unreadCount.toString()}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatTimeAgo(conv.lastTimestamp)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </motion.div>
    </div>
  );
}
