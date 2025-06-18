import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
  onCreateTask: () => void;
  showCreateTaskButton?: boolean;
}

export default function Header({ title, subtitle, onCreateTask, showCreateTaskButton = false }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-3">
          {showCreateTaskButton && (
            <Button onClick={onCreateTask}>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
