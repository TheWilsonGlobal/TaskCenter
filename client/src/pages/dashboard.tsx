import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import TasksTab from "@/components/TasksTab";
import ScriptsTab from "@/components/ScriptsTab";
import ProfilesTab from "@/components/ProfilesTab";
import WorkersTab from "@/components/WorkersTab";
import ApiTab from "@/components/ApiTab";
import CreateTaskModal from "@/components/CreateTaskModal";

type TabType = "tasks" | "scripts" | "profiles" | "workers" | "api";

const tabConfig = {
  tasks: {
    title: "Task Center",
    subtitle: "Manage and monitor your Puppeteer automation tasks",
  },
  scripts: {
    title: "Script Management",
    subtitle: "Upload and manage your TypeScript automation scripts",
  },
  profiles: {
    title: "Profile Configuration",
    subtitle: "Configure browser profiles and settings",
  },
  workers: {
    title: "Worker Management",
    subtitle: "Manage remote automation workers",
  },
  api: {
    title: "API Documentation",
    subtitle: "Test and explore available API endpoints",
  },
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("tasks");
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  const currentConfig = tabConfig[activeTab];

  const renderTabContent = () => {
    switch (activeTab) {
      case "tasks":
        return <TasksTab onCreateTask={() => setIsCreateTaskModalOpen(true)} />;
      case "scripts":
        return <ScriptsTab />;
      case "profiles":
        return <ProfilesTab />;
      case "workers":
        return <WorkersTab />;
      case "api":
        return <ApiTab />;
      default:
        return <TasksTab onCreateTask={() => setIsCreateTaskModalOpen(true)} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 flex flex-col">
        <Header
          title={currentConfig.title}
          subtitle={currentConfig.subtitle}
          onCreateTask={() => setIsCreateTaskModalOpen(true)}
          showCreateTaskButton={false}
        />

        <div className="flex-1 p-6 overflow-auto">{renderTabContent()}</div>
      </main>

      <CreateTaskModal
        open={isCreateTaskModalOpen}
        onOpenChange={setIsCreateTaskModalOpen}
      />
    </div>
  );
}
