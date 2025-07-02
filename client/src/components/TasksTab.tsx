import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Edit, Trash2, Search, ListTodo, Play, Check, AlertTriangle, Plus, RefreshCw, ChevronUp, ChevronDown, Monitor, Smartphone, Tablet } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState, useRef } from "react";
import type { Task } from "@shared/schema";
import EditTaskModal from "@/components/EditTaskModal";

interface TasksTabProps {
  onCreateTask: () => void;
}

export default function TasksTab({ onCreateTask }: TasksTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [isProfileDetailsOpen, setIsProfileDetailsOpen] = useState(false);
  const [selectedScript, setSelectedScript] = useState<any>(null);
  const [isScriptDetailsOpen, setIsScriptDetailsOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: tasks = [], isLoading, refetch, error } = useQuery<Task[]>({
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

  const filteredTasks = tasks
    .filter(task => {
      const matchesSearch = task.script?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           String(task.workerId).includes(searchTerm) ||
                           task.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => a.id - b.id);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      NEW: "bg-blue-100 text-blue-800",
      READY: "status-ready",
      RUNNING: "status-running",
      COMPLETED: "status-completed",
      FAILED: "status-failed",
      REJECTED: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={statusClasses[status as keyof typeof statusClasses] || "bg-blue-100 text-blue-800"}>
        {status}
      </Badge>
    );
  };



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

  const handleShowProfileDetails = (profile: any) => {
    setSelectedProfile(profile);
    setIsProfileDetailsOpen(true);
  };

  const handleShowScriptDetails = (script: any) => {
    setSelectedScript(script);
    setIsScriptDetailsOpen(true);
  };

  const scrollUp = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: -100, behavior: 'smooth' });
    }
  };

  const scrollDown = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: 100, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">

      {/* Task Table */}
      <Card>
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              onClick={onCreateTask}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Task</span>
            </Button>
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
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-24 h-8 text-xs border-0 bg-transparent p-0 focus:ring-0">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Status</SelectItem>
                      <SelectItem value="NEW">NEW</SelectItem>
                      <SelectItem value="READY">READY</SelectItem>
                      <SelectItem value="RUNNING">RUNNING</SelectItem>
                      <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                      <SelectItem value="FAILED">FAILED</SelectItem>
                      <SelectItem value="REJECTED">REJECTED</SelectItem>
                    </SelectContent>
                  </Select>
                </TableHead>
                <TableHead>Worker ID</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Script</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center space-y-3">
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                      <div className="text-red-600 font-medium">Cannot fetch tasks from task center</div>
                      <div className="text-slate-500 text-sm">Please check your connection and try again</div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRefresh}
                        className="mt-2"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTasks.length === 0 ? (
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
                        onClick={() => handleEditTask(task)}
                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {task.id}
                      </button>
                    </TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>{task.workerId}</TableCell>
                    <TableCell>
                      {task.profile ? (
                        <button
                          onClick={() => handleShowProfileDetails(task.profile)}
                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          {task.profile.name}
                        </button>
                      ) : (
                        <span className="italic text-slate-500">Dedicated</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {task.script ? (
                        <button
                          onClick={() => handleShowScriptDetails(task.script)}
                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          {task.script.name}
                        </button>
                      ) : (
                        'Unknown Script'
                      )}
                    </TableCell>
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
                          <Button 
                            variant="destructive"
                            size="sm" 
                            title="Reject Task (COMPLETED → REJECTED)"
                            onClick={() => updateTaskStatusMutation.mutate({ id: task.id, status: "REJECTED" })}
                            disabled={updateTaskStatusMutation.isPending}
                          >
                            Reject
                          </Button>
                        ) : task.status === "REJECTED" ? (
                          <Button 
                            variant="default"
                            size="sm" 
                            title="Mark as Completed (REJECTED → COMPLETED)"
                            onClick={() => updateTaskStatusMutation.mutate({ id: task.id, status: "COMPLETED" })}
                            disabled={updateTaskStatusMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Complete
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
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Task Details - #{selectedTask ? String(selectedTask.id).padStart(5, "0") : ""}</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="flex-1 relative">
              {/* Scroll Controls */}
              <div className="absolute right-2 top-2 z-10 flex flex-col space-y-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={scrollUp}
                  className="w-8 h-8 p-0"
                  title="Scroll up"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={scrollDown}
                  className="w-8 h-8 p-0"
                  title="Scroll down"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              {/* Scrollable Content */}
              <div 
                ref={scrollContainerRef}
                className="max-h-[50vh] overflow-y-auto pr-12 space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Task ID</label>
                    <p className="text-sm text-slate-900 font-mono">{String(selectedTask.id).padStart(5, "0")}</p>
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
                    <p className="text-sm text-slate-900">
                      {selectedTask.profile?.name || <span className="italic text-slate-500">Dedicated</span>}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Script</label>
                    <p className="text-sm text-slate-900 font-mono">{selectedTask.script?.name || 'Unknown Script'}</p>
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
              </div>
              
              {/* Fixed Footer */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 mt-4">
                <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                  Close
                </Button>
                {selectedTask.status === "NEW" && (
                  <Button onClick={() => {
                    setIsDetailsModalOpen(false);
                    handleEditTask(selectedTask);
                  }}>
                    Edit Task
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Profile Details Modal */}
      <Dialog open={isProfileDetailsOpen} onOpenChange={setIsProfileDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Profile Details</DialogTitle>
          </DialogHeader>
          
          {selectedProfile && (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="browser">Browser</TabsTrigger>
                    <TabsTrigger value="proxy">Proxy</TabsTrigger>
                    <TabsTrigger value="custom-field">Custom Field</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Profile ID</Label>
                        <Input
                          value={String(selectedProfile.id).padStart(3, "0")}
                          readOnly
                          className="bg-slate-50 text-slate-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Profile Name</Label>
                        <Input
                          value={selectedProfile.name}
                          readOnly
                          className="bg-slate-50 text-slate-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={selectedProfile.description || "No description"}
                          readOnly
                          className="bg-slate-50 text-slate-600"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="browser" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>User Agent</Label>
                        <Input
                          value={selectedProfile.userAgent}
                          readOnly
                          className="bg-slate-50 text-slate-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Custom User Agent</Label>
                        <Input
                          value={selectedProfile.customUserAgent || "Not set"}
                          readOnly
                          className="bg-slate-50 text-slate-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Viewport Width</Label>
                        <Input
                          value={String(selectedProfile.viewportWidth)}
                          readOnly
                          className="bg-slate-50 text-slate-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Viewport Height</Label>
                        <Input
                          value={String(selectedProfile.viewportHeight)}
                          readOnly
                          className="bg-slate-50 text-slate-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Timezone</Label>
                        <Input
                          value={selectedProfile.timezone}
                          readOnly
                          className="bg-slate-50 text-slate-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Language</Label>
                        <Input
                          value={selectedProfile.language}
                          readOnly
                          className="bg-slate-50 text-slate-600"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="proxy" className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={selectedProfile.useProxy}
                        disabled
                      />
                      <Label>Enable Proxy</Label>
                    </div>

                    {selectedProfile.useProxy && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Proxy Type</Label>
                            <Input
                              value={selectedProfile.proxyType}
                              readOnly
                              className="bg-slate-50 text-slate-600"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Proxy Host</Label>
                            <Input
                              value={selectedProfile.proxyHost}
                              readOnly
                              className="bg-slate-50 text-slate-600"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Proxy Port</Label>
                            <Input
                              value={selectedProfile.proxyPort}
                              readOnly
                              className="bg-slate-50 text-slate-600"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Proxy Username</Label>
                            <Input
                              value={selectedProfile.proxyUsername || "Not set"}
                              readOnly
                              className="bg-slate-50 text-slate-600"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="custom-field" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Custom Field (JSON)</Label>
                      <div className="w-full max-w-2xl">
                        <div className="max-h-80 overflow-y-auto">
                          <div className="bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg p-3 relative">
                            <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed" style={{
                              tabSize: 2,
                              lineHeight: '1.6',
                              fontSize: '12px',
                              fontFamily: '"Fira Code", "JetBrains Mono", ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                            }}>
                              <code dangerouslySetInnerHTML={{
                                __html: selectedProfile.customField && Object.keys(selectedProfile.customField).length > 0 
                                  ? JSON.stringify(selectedProfile.customField, null, 2)
                                      .replace(/("(?:[^"\\]|\\.)*")(\s*:)/g, '<span style="color: #0066cc;">$1</span><span style="color: #666;">$2</span>')
                                      .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span style="color: #008000;">$1</span>')
                                      .replace(/:\s*(true|false)/g, ': <span style="color: #800080;">$1</span>')
                                      .replace(/:\s*(\d+)/g, ': <span style="color: #ff6600;">$1</span>')
                                      .replace(/([{}[\],])/g, '<span style="color: #666;">$1</span>')
                                  : '<span style="color: #999; font-style: italic;">{\n  // No custom fields defined\n}</span>'
                              }} />
                            </pre>
                            <div className="absolute top-2 right-2">
                              <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-600 px-2 py-1 rounded text-xs text-slate-600 dark:text-slate-400">
                                JSON
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          )}
          
          <div className="flex justify-end pt-4 border-t border-slate-200 mt-4">
            <Button variant="outline" onClick={() => setIsProfileDetailsOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Script Details Modal */}
      <Dialog open={isScriptDetailsOpen} onOpenChange={setIsScriptDetailsOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Script Details</DialogTitle>
          </DialogHeader>
          
          {selectedScript && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <p className="text-sm text-slate-900">{selectedScript.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <p className="text-sm text-slate-900">{selectedScript.description || "No description"}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Size</label>
                <p className="text-sm text-slate-900">{selectedScript.size} bytes</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Source Code</label>
                <div className="max-h-96 overflow-y-auto">
                  <pre className="text-sm text-slate-900 bg-slate-50 p-4 rounded-lg overflow-x-auto font-mono" style={{
                    tabSize: 2,
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word',
                    lineHeight: '1.6',
                    fontSize: '13px',
                    fontFamily: '"Fira Code", "JetBrains Mono", ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                  }}>
                    {selectedScript.content}
                  </pre>
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <Button variant="outline" onClick={() => setIsScriptDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
