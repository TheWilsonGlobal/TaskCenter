import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Task, Script, Profile } from "@shared/schema";

interface EditTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

export default function EditTaskModal({ open, onOpenChange, task }: EditTaskModalProps) {
  const [workerId, setWorkerId] = useState("");
  const [profile, setProfile] = useState("");
  const [script, setScript] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const { data: scripts = [] } = useQuery<Script[]>({
    queryKey: ["/api/scripts"],
  });

  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", `/api/tasks/${task?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task Updated",
        description: "Task has been updated successfully.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
    },
  });

  // Populate form when task changes
  useEffect(() => {
    if (task) {
      setWorkerId(String(task.workerId) || "");
      setProfile(task.profile?.name || "");
      setScript(task.script?.name || "");
      setStatus(task.status || "NEW");
      setNotes(task.respond || "");
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!workerId.trim()) {
      toast({
        title: "Validation Error",
        description: "Worker ID is required",
        variant: "destructive",
      });
      return;
    }

    if (!profile) {
      toast({
        title: "Validation Error",
        description: "Please select a profile",
        variant: "destructive",
      });
      return;
    }

    if (!script) {
      toast({
        title: "Validation Error",
        description: "Please select a script",
        variant: "destructive",
      });
      return;
    }

    const selectedProfile = profiles.find(p => p.name === profile);
    const selectedScript = scripts.find(s => s.name === script);

    const taskData = {
      workerId: workerId.trim(),
      profileId: selectedProfile?.id,
      scriptId: selectedScript?.id,
      status,
      respond: notes.trim(),
    };

    updateTaskMutation.mutate(taskData);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task #{String(task.id).padStart(3, "0")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="workerId">Worker ID</Label>
            <Input
              id="workerId"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              placeholder="Enter worker ID..."
              required
            />
          </div>

          <div>
            <Label htmlFor="profile">Browser Profile</Label>
            <Select value={profile} onValueChange={setProfile} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a profile..." />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((prof) => (
                  <SelectItem key={prof.id} value={prof.name}>
                    {prof.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="script">Script</Label>
            <Select value={script} onValueChange={setScript} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a script..." />
              </SelectTrigger>
              <SelectContent>
                {scripts.map((scr) => (
                  <SelectItem key={scr.id} value={scr.name}>
                    {scr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus} required>
              <SelectTrigger>
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW">NEW</SelectItem>
                <SelectItem value="READY">READY</SelectItem>
                <SelectItem value="RUNNING">RUNNING</SelectItem>
                <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                <SelectItem value="FAILED">FAILED</SelectItem>
                <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                <SelectItem value="REJECTED">REJECTED</SelectItem>
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
              disabled={updateTaskMutation.isPending}
            >
              {updateTaskMutation.isPending ? "Updating..." : "Update Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}