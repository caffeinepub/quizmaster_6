import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateUserProfile } from "../hooks/useQueries";

interface UsernameDialogProps {
  open: boolean;
}

export default function UsernameDialog({ open }: UsernameDialogProps) {
  const [username, setUsername] = useState("");
  const createProfile = useCreateUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    try {
      await createProfile.mutateAsync(username.trim());
      toast.success("Welcome to QuizMaster!");
    } catch {
      toast.error("Failed to create profile. Please try again.");
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="glass-card border-border"
        data-ocid="username.dialog"
      >
        <DialogHeader>
          <DialogTitle className="gradient-text text-xl">
            Welcome to QuizMaster!
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose a username to get started.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. QuizWizard42"
              className="mt-1 bg-secondary border-border"
              data-ocid="username.input"
            />
          </div>
          <Button
            type="submit"
            disabled={!username.trim() || createProfile.isPending}
            className="w-full gradient-bg border-0 text-white font-semibold"
            data-ocid="username.submit_button"
          >
            {createProfile.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Get Started
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
