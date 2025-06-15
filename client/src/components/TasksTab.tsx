import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Edit, Trash2, Search, ListTodo, Play, Check, AlertTriangle, Plus, RefreshCw } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import type { Task } from "@shared/schema";
import EditTaskModal from "@/components/EditTaskModal";

export default function TasksTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const { data: tasks = [], isLoading, refetch } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const handleRefresh = () => {
    refetch();
  };

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiRequest("PUT", `/api/tasks/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.script.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.workerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.profile.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      NEW: "bg-blue-100 text-blue-800",
      READY: "status-ready",
      RUNNING: "status-running",
      COMPLETED: "status-completed",
      FAILED: "status-failed",
      CONFIRMED: "bg-emerald-100 text-emerald-800",
      REJECTED: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={statusClasses[status as keyof typeof statusClasses] || "bg-blue-100 text-blue-800"}>
        {status}
      </Badge>
    );
  };

  const getStatusStats = () => {
    const stats = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: tasks.length,
      new: stats.NEW || 0,
      ready: stats.READY || 0,
      running: stats.RUNNING || 0,
      completed: stats.COMPLETED || 0,
      failed: stats.FAILED || 0,
      confirmed: stats.CONFIRMED || 0,
      rejected: stats.REJECTED || 0,
    };
  };

  const stats = getStatusStats();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} mins ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours ago`;
    return `${Math.floor(minutes / 1440)} days ago`;
  };

  const handleDeleteTask = (id: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "NEW" ? "READY" : "NEW";
    updateTaskStatusMutation.mutate({ id, status: newStatus });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleShowTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsModalOpen(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Tasks</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ListTodo className="text-primary text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">New</p>
                <p className="text-2xl font-bold text-slate-900">{stats.new}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ListTodo className="text-blue-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Running</p>
                <p className="text-2xl font-bold text-slate-900">{stats.running}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Play className="text-warning text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="text-success text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Failed</p>
                <p className="text-2xl font-bold text-slate-900">{stats.failed}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-error text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Confirmed</p>
                <p className="text-2xl font-bold text-slate-900">{stats.confirmed}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Check className="text-emerald-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Rejected</p>
                <p className="text-2xl font-bold text-slate-900">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-red-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ListTodo Table */}
      <Card>
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-slate-900">ListTodo</h3>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="NEW">NEW</SelectItem>
                  <SelectItem value="READY">READY</SelectItem>
                  <SelectItem value="RUNNING">RUNNING</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                  <SelectItem value="FAILED">FAILED</SelectItem>
                  <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                  <SelectItem value="REJECTED">REJECTED</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center space-x-2"
                title="Refresh tasks"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Worker ID</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Script</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                    {searchTerm || statusFilter !== "all" 
                      ? "No tasks match your filters"
                      : "No tasks created yet. Create your first task to get started."
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-sm">
                      <button
                        onClick={() => handleShowTaskDetails(task)}
                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {String(task.id).padStart(3, "0")}
                      </button>
                    </TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>{task.workerId}</TableCell>
                    <TableCell>{task.profile}</TableCell>
                    <TableCell className="font-mono text-sm">{task.script}</TableCell>
                    <TableCell className="text-slate-500">
                      {formatDate(task.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {(task.status === "NEW" || task.status === "READY") ? (
                          <Button 
                            variant={task.status === "READY" ? "default" : "secondary"}
                            size="sm" 
                            title={task.status === "NEW" ? "Click to Activate (NEW → READY)" : "Click to Deactivate (READY → NEW)"}
                            onClick={() => handleToggleStatus(task.id, task.status)}
                            disabled={updateTaskStatusMutation.isPending}
                            className={task.status === "READY" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                          >
                            {task.status === "NEW" ? "Active" : "Inactive"}
                          </Button>
                        ) : task.status === "COMPLETED" ? (
                          <>
                            <Button 
                              variant="default"
                              size="sm" 
                              title="Confirm Task (COMPLETED → CONFIRMED)"
                              onClick={() => updateTaskStatusMutation.mutate({ id: task.id, status: "CONFIRMED" })}
                              disabled={updateTaskStatusMutation.isPending}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Confirm
                            </Button>
                            <Button 
                              variant="destructive"
                              size="sm" 
                              title="Reject Task (COMPLETED → REJECTED)"
                              onClick={() => updateTaskStatusMutation.mutate({ id: task.id, status: "REJECTED" })}
                              disabled={updateTaskStatusMutation.isPending}
                            >
                              Reject
                            </Button>
                          </>
                        ) : task.status === "CONFIRMED" ? (
                          <Button 
                            variant="destructive"
                            size="sm" 
                            title="Reject Task (CONFIRMED → REJECTED)"
                            onClick={() => updateTaskStatusMutation.mutate({ id: task.id, status: "REJECTED" })}
                            disabled={updateTaskStatusMutation.isPending}
                          >
                            Reject
                          </Button>
                        ) : task.status === "REJECTED" ? (
                          <Button 
                            variant="default"
                            size="sm" 
                            title="Confirm Task (REJECTED → CONFIRMED)"
                            onClick={() => updateTaskStatusMutation.mutate({ id: task.id, status: "CONFIRMED" })}
                            disabled={updateTaskStatusMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Confirm
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {task.status === "NEW" && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Edit"
                            onClick={() => handleEditTask(task)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Delete"
                          onClick={() => handleDeleteTask(task.id)}
                          disabled={deleteTaskMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredTasks.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </div>
          </div>
        )}
      </Card>

      <EditTaskModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        task={editingTask}
      />

      {/* Task Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Task Details - #{selectedTask ? String(selectedTask.id).padStart(3, "0") : ""}</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Task ID</label>
                  <p className="text-sm text-slate-900 font-mono">{String(selectedTask.id).padStart(3, "0")}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <div>{getStatusBadge(selectedTask.status)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Worker ID</label>
                  <p className="text-sm text-slate-900">{selectedTask.workerId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Profile</label>
                  <p className="text-sm text-slate-900">{selectedTask.profile}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Script</label>
                  <p className="text-sm text-slate-900 font-mono">{selectedTask.script}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Created</label>
                  <p className="text-sm text-slate-900">{formatDate(selectedTask.createdAt)}</p>
                </div>
              </div>
              
              {selectedTask.respond && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Response</label>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-900 whitespace-pre-wrap">{selectedTask.respond}</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleEditTask(selectedTask);
                }}>
                  Edit Task
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
