import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2, Plus, Search, Users } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import type { Worker } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function WorkersTab() {
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");
  
  const { toast } = useToast();

  const { data: workers = [], isLoading } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const createWorkerMutation = useMutation({
    mutationFn: (workerData: any) => apiRequest("POST", "/api/workers", workerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      setIsEditorOpen(false);
      resetForm();
      toast({
        title: "Worker created",
        description: "Worker has been successfully created",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating worker",
        description: error.message || "Failed to create worker",
        variant: "destructive",
      });
    }
  });

  const updateWorkerMutation = useMutation({
    mutationFn: ({ id, workerData }: { id: number; workerData: any }) => 
      apiRequest("PUT", `/api/workers/${id}`, workerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      setIsEditorOpen(false);
      resetForm();
      toast({
        title: "Worker updated",
        description: "Worker has been successfully updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating worker",
        description: error.message || "Failed to update worker",
        variant: "destructive",
      });
    }
  });

  const deleteWorkerMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/workers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      toast({
        title: "Worker deleted",
        description: "Worker has been successfully deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting worker",
        description: error.message || "Failed to delete worker",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setDescription("");
    setSelectedWorkerId(null);
    setIsEditorOpen(true);
  };

  const loadWorkerData = (worker: Worker) => {
    setUsername(worker.username);
    setPassword(""); // Don't prefill password for security
    setDescription(worker.description || "");
    setSelectedWorkerId(worker.id);
    setIsEditorOpen(true);
    
    toast({
      title: "Worker loaded",
      description: `${worker.username} loaded for editing`,
    });
  };

  const handleSaveWorker = () => {
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    if (!password.trim() && !selectedWorkerId) {
      toast({
        title: "Password required",
        description: "Please enter a password",
        variant: "destructive",
      });
      return;
    }

    const workerData = {
      username: username.trim(),
      description: description.trim(),
      ...(password.trim() && { password: password.trim() })
    };

    if (selectedWorkerId) {
      updateWorkerMutation.mutate({ id: selectedWorkerId, workerData });
    } else {
      createWorkerMutation.mutate(workerData);
    }
  };

  const handleDeleteWorker = (id: number) => {
    if (confirm("Are you sure you want to delete this worker?")) {
      deleteWorkerMutation.mutate(id);
    }
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (worker.description && worker.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading workers...</div>;
  }

  return (
    <>
      <Card>
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Worker
            </Button>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search workers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            </div>
          </div>
        </div>
        <CardContent className="p-0">
          {filteredWorkers.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              {searchTerm 
                ? "No workers match your search"
                : "No workers created yet. Create your first worker to get started."
              }
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkers.sort((a, b) => a.id - b.id).map((worker) => (
                  <TableRow 
                    key={worker.id} 
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => loadWorkerData(worker)}
                  >
                    <TableCell className="font-mono text-sm">
                      {String(worker.id).padStart(3, "0")}
                    </TableCell>
                    <TableCell className="font-medium">{worker.username}</TableCell>
                    <TableCell className="text-slate-600">
                      {worker.description || "No description"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => loadWorkerData(worker)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteWorker(worker.id)}
                          title="Delete"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedWorkerId ? "Edit Worker" : "Create New Worker"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="worker_001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password {selectedWorkerId && "(leave blank to keep current)"}
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="secure_password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <Input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Remote automation worker"
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={handleSaveWorker}
                disabled={createWorkerMutation.isPending || updateWorkerMutation.isPending}
                className="flex-1"
              >
                {(createWorkerMutation.isPending || updateWorkerMutation.isPending) 
                  ? "Saving..." 
                  : selectedWorkerId 
                    ? "Update Worker" 
                    : "Create Worker"}
              </Button>
              <Button variant="secondary" onClick={() => {
                resetForm();
                setIsEditorOpen(false);
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}