import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Script, Profile } from "@shared/schema";

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateTaskModal({ open, onOpenChange }: CreateTaskModalProps) {
  const [workerId, setWorkerId] = useState("");
  const [profile, setProfile] = useState("");
  const [script, setScript] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const { data: scripts = [] } = useQuery<Script[]>({
    queryKey: ["/api/scripts"],
    enabled: open,
  });

  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
    enabled: open,
  });

  const createTaskMutation = useMutation({
    mutationFn: (taskData: any) => apiRequest("POST", "/api/tasks", taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      resetForm();
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setWorkerId("");
    setProfile("");
    setScript("");
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!workerId.trim()) {
      toast({
        title: "Worker ID required",
        description: "Please enter a worker ID",
        variant: "destructive",
      });
      return;
    }



    if (!script) {
      toast({
        title: "Script required",
        description: "Please select a script",
        variant: "destructive",
      });
      return;
    }

    const selectedProfile = profile === "dedicated" ? null : profiles.find(p => p.name === profile);
    const selectedScript = scripts.find(s => s.name === script);

    const taskData = {
      workerId: workerId.trim(),
      profileId: selectedProfile?.id || null,
      scriptId: selectedScript?.id,
      status: "NEW",
      respond: notes.trim(),
    };

    createTaskMutation.mutate(taskData);
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="workerId">Worker ID</Label>
            <Input
              id="workerId"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              placeholder="worker-01"
              required
            />
          </div>

          <div>
            <Label htmlFor="profile">Profile (Optional)</Label>
            <Select value={profile} onValueChange={setProfile}>
              <SelectTrigger>
                <SelectValue placeholder="Select Profile or leave empty for dedicated profile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dedicated">Use Dedicated Profile</SelectItem>
                {profiles.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No profiles available
                  </SelectItem>
                ) : (
                  profiles.map((p) => (
                    <SelectItem key={p.id} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="script">Script</Label>
            <Select value={script} onValueChange={setScript} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Script" />
              </SelectTrigger>
              <SelectContent>
                {scripts.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No scripts available
                  </SelectItem>
                ) : (
                  scripts.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or description..."
              className="h-20"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createTaskMutation.isPending}
            >
              {createTaskMutation.isPending ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
