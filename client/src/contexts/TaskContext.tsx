import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

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

interface TaskState extends Task {
  isRunning?: boolean;
  timeoutId?: NodeJS.Timeout;
}

interface TaskContextType {
  tasksState: { [key: number]: TaskState };
  updateTaskStatus: (taskId: number, status: string) => void;
  handleRunTask: (taskId: number) => void;
  handleStopTask: (taskId: number) => void;
  refetchTasks: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasksState, setTasksState] = useState<{ [key: number]: TaskState }>({});
  const queryClient = useQueryClient();
  
  const { data: tasks = [], refetch } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  const updateTaskStatusInDb = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: string }) => {
      const response = await axios.put(`/api/tasks/${taskId}`, { status });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch tasks to ensure UI is in sync with the database
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error) => {
      console.error('Failed to update task status:', error);
      // Optionally show a toast notification here
    }
  });

  // Initialize tasks state when tasks are loaded
  useEffect(() => {
    if (tasks.length > 0) {
      setTasksState(prev => {
        const newState = { ...prev };
        let needsUpdate = false;

        // Check for tasks that should be running but don't have a timeout
        tasks.forEach(task => {
          const taskState = prev[task.id];
          
          if (!taskState) {
            // New task, add to state
            newState[task.id] = {
              ...task,
              isRunning: false,
              timeoutId: undefined
            };
            needsUpdate = true;
          } else if (taskState.status === 'RUNNING' && !taskState.timeoutId) {
            // Task is running but doesn't have a timeout, set one
            const timeoutId = setTimeout(async () => {
              await updateTaskStatus(task.id, 'COMPLETED');
            }, 30000);

            newState[task.id] = {
              ...taskState,
              timeoutId,
              isRunning: true
            };
            needsUpdate = true;
          } else if (taskState.status !== task.status) {
            // Status changed from the server, update local state
            newState[task.id] = {
              ...taskState,
              ...task,
              isRunning: task.status === 'RUNNING'
            };
            needsUpdate = true;
          }
        });

        return needsUpdate ? newState : prev;
      });
    }
  }, [tasks]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(tasksState).forEach(task => {
        if (task.timeoutId) {
          clearTimeout(task.timeoutId);
        }
      });
    };
  }, [tasksState]);

  const updateTaskStatus = useCallback(async (taskId: number, status: string) => {
    // Clear any existing timeout if status is changing from RUNNING
    if (tasksState[taskId]?.status === 'RUNNING' && status !== 'RUNNING') {
      if (tasksState[taskId]?.timeoutId) {
        clearTimeout(tasksState[taskId].timeoutId!);
      }
    }

    // Update local state immediately for better UX
    setTasksState(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        status,
        isRunning: status === 'RUNNING',
        ...(status !== 'RUNNING' && { timeoutId: undefined })
      }
    }));

    // Update in the database
    try {
      await updateTaskStatusInDb.mutateAsync({ taskId, status });
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert local state if update fails
      setTasksState(prev => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          status: prev[taskId]?.status || 'UNKNOWN',
          isRunning: false,
          timeoutId: undefined
        }
      }));
    }
  }, [updateTaskStatusInDb]);

  const handleRunTask = useCallback(async (taskId: number) => {
    // Clear any existing timeout
    if (tasksState[taskId]?.timeoutId) {
      clearTimeout(tasksState[taskId].timeoutId!);
    }

    // Update to RUNNING state
    await updateTaskStatus(taskId, 'RUNNING');

    // Set timeout to mark as COMPLETED after 30 seconds
    const timeoutId = setTimeout(async () => {
      console.log(`Task ${taskId} timeout completed, marking as COMPLETED`);
      await updateTaskStatus(taskId, 'COMPLETED');
    }, 30000);

    // Save the timeout ID to be able to clear it if needed
    setTasksState(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        timeoutId,
        isRunning: true,
        status: 'RUNNING' // Ensure status is set locally
      }
    }));

    // Log for debugging
    console.log(`Started task ${taskId}, will complete in 30 seconds`);
  }, [tasksState, updateTaskStatus]);

  const handleStopTask = useCallback(async (taskId: number) => {
    // Clear the completion timeout
    if (tasksState[taskId]?.timeoutId) {
      clearTimeout(tasksState[taskId].timeoutId!);
    }
    
    // Update to FAILED state
    await updateTaskStatus(taskId, 'FAILED');
  }, [tasksState, updateTaskStatus]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    tasksState,
    updateTaskStatus,
    handleRunTask,
    handleStopTask,
    refetchTasks: refetch
  }), [tasksState, updateTaskStatus, handleRunTask, handleStopTask, refetch]);

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
