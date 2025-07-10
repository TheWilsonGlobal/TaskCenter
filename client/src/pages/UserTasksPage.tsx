import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Play, StopCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '@/contexts/TaskContext';
import { queryClient } from '@/lib/queryClient';
import type { Task } from '@shared/schema';

const UserTasksPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { 
    tasksState, 
    handleRunTask, 
    handleStopTask, 
    refetchTasks 
  } = useTasks();

  const { data: tasks = [], isLoading, error } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  const getTaskStatus = (taskId: number) => {
    return tasksState[taskId]?.status || 'UNKNOWN';
  };

  const handleRefresh = () => {
    refetchTasks();
  };

  const filteredTasks = tasks
    .filter(task => {
      const taskStatus = getTaskStatus(task.id);
      const matchesSearch = task.script?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         String(task.workerId).includes(searchTerm) ||
                         task.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || taskStatus === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => a.id - b.id);

  const handleTaskSelect = (taskId: number) => {
    // setSelectedTasks implementation is missing in the provided code edit
  };

  const handleRunSelected = () => {
    // handleRunSelected implementation is missing in the provided code edit
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">Error loading tasks. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">TC</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Task Center</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Task Management</h1>
          <p className="mt-1 text-sm text-gray-500">View and manage all tasks in the system</p>
        </div>

        {/* Tasks Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">All Tasks</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
                </p>
              </div>
              {/* handleRunSelected button is missing in the provided code edit */}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    {/* checkbox implementation is missing in the provided code edit */}
                  </TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Worker</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead>Script</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-gray-50">
                    <TableCell>
                      {/* checkbox implementation is missing in the provided code edit */}
                    </TableCell>
                    <TableCell className="font-medium">{task.id}</TableCell>
                    <TableCell>{getStatusBadge(getTaskStatus(task.id))}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {task.worker?.username || `Worker ${task.workerId}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {task.profile?.name || 'N/A'}
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
                    <TableCell className="text-right">
                      {getTaskStatus(task.id) === 'RUNNING' ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleStopTask(task.id)}
                          className="bg-red-100 hover:bg-red-200"
                        >
                          <StopCircle className="h-4 w-4 mr-1" />
                          Stop
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleRunTask(task.id)}
                          disabled={task.status !== 'READY' && task.status !== 'FAILED'}
                          className={(task.status === 'READY' || task.status === 'FAILED') ? 'bg-green-100 hover:bg-green-200' : ''}
                        >
                          <Play className={`h-4 w-4 mr-1 ${task.status === 'READY' ? 'text-green-700' : 'text-gray-400'}`} />
                          Run
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-8 text-center text-gray-500">
                      No tasks found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTasksPage;
