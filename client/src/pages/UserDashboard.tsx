import React from 'react';
import { Link } from 'wouter';

const UserDashboard: React.FC = () => {
  // Mock data for the tasks table
  const tasks = [
    { id: '123', workerId: 'worker-1', profile: 'Profile 1', script: 'Script 1', status: 'READY', created: '2023-07-08' },
    { id: '124', workerId: 'worker-2', profile: 'Profile 2', script: 'Script 2', status: 'COMPLETED', created: '2023-07-07' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold">W</span>
          </div>
          <h1 className="text-xl font-bold">Worker Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Connected</span>
          </div>
          <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        {/* User Info Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Hello, User</h2>
              <p className="text-gray-400">Welcome back to your dashboard</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/" className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                Home
              </Link>
              <button className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition">
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-gray-400 text-sm uppercase">Current Session</h3>
            <div className="mt-2">
              <p className="text-2xl font-bold">User ID: 12345</p>
              <p className="text-gray-400">Active sessions: 1</p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-gray-400 text-sm uppercase">Tasks</h3>
            <div className="mt-2">
              <p className="text-2xl font-bold">5</p>
              <p className="text-gray-400">Total tasks</p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-gray-400 text-sm uppercase">Status</h3>
            <div className="mt-2">
              <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">Active</span>
              <p className="text-gray-400 mt-1">All systems operational</p>
            </div>
          </div>
        </div>

        {/* Task Management */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Task Management</h2>
              <p className="text-gray-400">Manage your tasks and monitor their status</p>
            </div>
            <button className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition">
              Fetch Tasks
            </button>
          </div>

          {/* Tasks Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-700 text-left text-xs uppercase tracking-wider">
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Worker ID</th>
                  <th className="px-6 py-3">Profile</th>
                  <th className="px-6 py-3">Script</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">{task.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                        {task.workerId}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-blue-500 rounded text-xs">
                        {task.profile}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-green-500 rounded text-xs">
                        {task.script}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 py-1 rounded text-xs ${
                          task.status === 'READY' 
                            ? 'bg-yellow-500' 
                            : task.status === 'COMPLETED' 
                            ? 'bg-green-500' 
                            : 'bg-gray-500'
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {task.created}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700 transition text-sm">
                        Run
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
