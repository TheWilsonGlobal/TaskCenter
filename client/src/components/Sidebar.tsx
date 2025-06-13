import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, ListTodo, Code, UserCog, Plug } from "lucide-react";
import type { Task, Script } from "@shared/schema";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: "tasks" | "scripts" | "profiles" | "api") => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: scripts = [] } = useQuery<Script[]>({
    queryKey: ["/api/scripts"],
  });

  const activeWorkers = new Set(
    tasks
      .filter((task) => task.status === "RUNNING")
      .map((task) => task.workerId),
  ).size;

  const getNavItemClass = (tab: string) => {
    return `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer w-full text-left ${
      activeTab === tab
        ? "bg-primary text-white hover:bg-primary hover:text-white"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;
  };

  return (
    <nav className="w-64 bg-white shadow-sm border-r border-slate-200 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="text-white text-sm" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Task Center
            </h1>
            <p className="text-xs text-slate-500">Task Automation</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Button
              variant="ghost"
              className={getNavItemClass("tasks")}
              onClick={() => onTabChange("tasks")}
            >
              <ListTodo className="h-5 w-5" />
              <span>ListTodo</span>
              {tasks.length > 0 && (
                <Badge className="ml-auto bg-primary text-white text-xs">
                  {tasks.length}
                </Badge>
              )}
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              className={getNavItemClass("scripts")}
              onClick={() => onTabChange("scripts")}
            >
              <Code className="h-5 w-5" />
              <span>Scripts</span>
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              className={getNavItemClass("profiles")}
              onClick={() => onTabChange("profiles")}
            >
              <UserCog className="h-5 w-5" />
              <span>Profiles</span>
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              className={getNavItemClass("api")}
              onClick={() => onTabChange("api")}
            >
              <Plug className="h-5 w-5" />
              <span>API Endpoints</span>
            </Button>
          </li>
        </ul>
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-slate-200">
        <div className="text-xs text-slate-500 space-y-1">
          <div className="flex justify-between">
            <span>Active Workers:</span>
            <span className="text-success font-medium">{activeWorkers}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Scripts:</span>
            <span className="font-medium">{scripts.length}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
