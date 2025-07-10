import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Play, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '@/contexts/TaskContext';
import { AppealDialog } from '@/components/AppealDialog';

type Task = {
  id: number;
  status: string;
  workerId: number;
  worker?: {
    username?: string;
  };
  profile?: {
    name?: string;
  };
  script?: {
    name?: string;
  };
  scriptId?: number;
  respond?: string;
  createdAt: string;
};

const UserDashboard: React.FC = () => {
  const [selectedTasks, setSelectedTasks] = React.useState<number[]>([]);
  const [appealTask, setAppealTask] = React.useState<{id: number; status: string} | null>(null);
  const [isAppealDialogOpen, setIsAppealDialogOpen] = React.useState(false);
  
  const { 
    tasksState, 
    handleRunTask, 
    handleStopTask, 
    refetchTasks 
  } = useTasks();

  const handleAppealClick = (task: Task) => {
    setAppealTask({
      id: task.id,
      status: task.status
    });
    setIsAppealDialogOpen(true);
  };

  const handleAppealSubmit = async (reason: string) => {
    // Here you would typically make an API call to submit the appeal
    console.log(`Submitting appeal for task ${appealTask?.id}:`, reason);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // After successful submission, you might want to update the task status or show a success message
    alert('Your appeal has been submitted successfully!');
  };

  // Fetch tasks from the API
  const { data: tasks = [], isLoading, error } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  const handleRefresh = () => {
    refetchTasks();
  };

  const handleTaskSelect = (taskId: number) => {
    setSelectedTasks((prev: number[]) => 
      prev.includes(taskId)
        ? prev.filter((id: number) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleRunSelected = () => {
    console.log('Running tasks:', selectedTasks);
    // Here you would typically make an API call to run the selected tasks
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      NEW: 'bg-blue-100 text-blue-800',
      READY: 'bg-yellow-100 text-yellow-800',
      RUNNING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge className={statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} mins ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours ago`;
    return date.toLocaleString();
  };

  // Get tasks from state or fallback to API response
  const getTaskDisplayData = (taskId: number) => {
    return tasksState[taskId] || tasks.find(t => t.id === taskId);
  };

  // Sort tasks by ID in ascending order (lowest to highest)
  const filteredTasks = Array.isArray(tasks) 
    ? [...tasks]
        .map(task => getTaskDisplayData(task.id) || task)
        .sort((a: Task, b: Task) => a.id - b.id)
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-900 text-xl">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500 text-xl">Error loading tasks. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">TC</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Worker Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Active Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">View and manage your active tasks</p>
        </div>

        {/* Tasks Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Active Tasks</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
                </p>
              </div>
              {selectedTasks.length > 0 && (
                <Button onClick={handleRunSelected}>
                  <Play className="h-4 w-4 mr-2" />
                  Run Selected ({selectedTasks.length})
                </Button>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTasks(filteredTasks.map((task: Task) => task.id));
                        } else {
                          setSelectedTasks([]);
                        }
                      }}
                      checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                    />
                  </TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Worker</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead>Script</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task: Task) => (
                  <TableRow key={task.id} className="hover:bg-gray-50">
                    <TableCell>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => handleTaskSelect(task.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{task.id}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {task.worker?.username || `Worker ${task.workerId}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {task.profile?.name || 'Dedicated'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {task.script?.name || `Script ${task.scriptId}`}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      <span className="text-sm text-gray-500">{task.respond || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">{formatDate(task.createdAt)}</span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(tasksState[task.id]?.status || task.status)}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {(tasksState[task.id]?.status === 'RUNNING' || task.status === 'RUNNING') ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleStopTask(task.id)}
                          className="bg-red-100 hover:bg-red-200"
                        >
                          <span className="h-4 w-4 mr-1 rounded-full bg-red-500 animate-pulse"></span>
                          Stop
                        </Button>
                      ) : task.status === 'REJECTED' ? (
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleRunTask(task.id)}
                            className="bg-green-100 hover:bg-green-200"
                          >
                            <Play className="h-4 w-4 mr-1 text-green-700" />
                            Run
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAppealClick(task)}
                            className="bg-amber-100 hover:bg-amber-200 text-amber-800"
                          >
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Appeal
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleRunTask(task.id)}
                          disabled={task.status !== 'READY' && task.status !== 'FAILED'}
                          className={(task.status === 'READY' || task.status === 'FAILED') ? 'bg-green-100 hover:bg-green-200' : ''}
                        >
                          <Play className={`h-4 w-4 mr-1 ${(task.status === 'READY' || task.status === 'FAILED') ? 'text-green-700' : 'text-gray-400'}`} />
                          Run
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-8 text-center text-gray-500">
                      No active tasks found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Appeal Dialog */}
      <AppealDialog
        isOpen={isAppealDialogOpen}
        onClose={() => {
          setIsAppealDialogOpen(false);
          setAppealTask(null);
        }}
        onSubmit={handleAppealSubmit}
      />
    </div>
  );
};

export default UserDashboard;
