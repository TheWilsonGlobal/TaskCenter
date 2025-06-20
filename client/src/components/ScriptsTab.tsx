import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Edit, Trash2, Plus, Upload, Search } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import type { Script } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function ScriptsTab() {
  const [selectedScriptId, setSelectedScriptId] = useState<number | null>(null);
  const [scriptName, setScriptName] = useState("");
  const [description, setDescription] = useState("");
  const [scriptContent, setScriptContent] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: scripts = [], isLoading } = useQuery<Script[]>({
    queryKey: ["/api/scripts"],
  });

  const createScriptMutation = useMutation({
    mutationFn: (scriptData: any) => apiRequest("POST", "/api/scripts", scriptData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
      setIsEditorOpen(false);
      toast({
        title: "Success",
        description: "Script created successfully",
      });
    },
  });

  const updateScriptMutation = useMutation({
    mutationFn: ({ id, scriptData }: { id: number; scriptData: any }) => 
      apiRequest("PUT", `/api/scripts/${id}`, scriptData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
      setIsEditorOpen(false);
      toast({
        title: "Success",
        description: "Script updated successfully",
      });
    },
  });

  const deleteScriptMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/scripts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
      toast({
        title: "Success",
        description: "Script deleted successfully",
      });
    },
  });

  const resetForm = () => {
    setScriptName("New Script");
    setDescription("");
    setScriptContent("// Your script code here\nconsole.log('Hello, World!');");
    setSelectedScriptId(null);
    setIsEditorOpen(true);
  };

  const loadScriptData = (script: Script) => {
    setScriptName(script.name);
    setDescription(script.description || "");
    setScriptContent(script.content);
    setSelectedScriptId(script.id);
    setIsEditorOpen(true);
  };

  const handleSaveScript = () => {
    if (!scriptName.trim()) {
      toast({
        title: "Invalid script name",
        description: "Script name is required",
        variant: "destructive",
      });
      return;
    }

    const scriptData = {
      name: scriptName,
      description,
      content: scriptContent,
    };

    if (selectedScriptId) {
      updateScriptMutation.mutate({ id: selectedScriptId, scriptData });
    } else {
      createScriptMutation.mutate(scriptData);
    }
  };

  const handleDownload = async (script: Script) => {
    try {
      const response = await fetch(`/api/scripts/${script.id}/download`, {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${script.name}.ts`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download script",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this script?")) {
      deleteScriptMutation.mutate(id);
    }
  };

  const handleImportScript = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const fileName = file.name.replace(/\.(js|ts)$/, '');
      
      setScriptName(fileName);
      setScriptContent(content);
      setDescription(`Imported from ${file.name}`);
      setSelectedScriptId(null);
      setIsEditorOpen(true);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const filteredScripts = scripts.filter(script => {
    const matchesSearch = script.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (script.description && script.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading scripts...</div>;
  }

  return (
    <>
      <Card>
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Script
            </Button>
            <input
              type="file"
              id="import-script"
              className="hidden"
              accept=".js,.ts"
              onChange={handleImportScript}
            />
            <Button 
              variant="outline" 
              onClick={() => document.getElementById('import-script')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search scripts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            </div>
          </div>
        </div>
        <CardContent className="p-0">
          {filteredScripts.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              {searchTerm 
                ? "No scripts match your search"
                : "No scripts available. Scripts will appear here when they are added to the system."
              }
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScripts.sort((a, b) => a.id - b.id).map((script) => (
                  <TableRow key={script.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-sm">
                      {String(script.id).padStart(3, "0")}
                    </TableCell>
                    <TableCell className="font-medium">{script.name}</TableCell>
                    <TableCell className="text-slate-600">
                      {script.description || "No description"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDownload(script)}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => loadScriptData(script)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(script.id)}
                          disabled={deleteScriptMutation.isPending}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
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
        <DialogContent className="sm:max-w-4xl sm:max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedScriptId ? "Edit Script" : "Create New Script"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Script Name</label>
              <Input
                type="text"
                value={scriptName}
                onChange={(e) => setScriptName(e.target.value)}
                placeholder="New Script"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the script"
                className="h-20"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Source Code</label>
              <div className="relative">
                <Textarea
                  value={scriptContent}
                  onChange={(e) => setScriptContent(e.target.value)}
                  placeholder="// Script source code will appear here&#10;console.log('Hello World!');"
                  rows={24}
                  className="font-mono text-sm bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg p-4 resize-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors leading-relaxed"
                  style={{
                    tabSize: 2,
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word',
                    lineHeight: '1.6',
                    fontSize: '13px',
                    fontFamily: '"Fira Code", "JetBrains Mono", ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                  }}
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
                <div className="absolute top-2 right-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500 bg-white dark:bg-slate-800 px-2 py-1 rounded border">
                      JavaScript
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={handleSaveScript}
                disabled={createScriptMutation.isPending || updateScriptMutation.isPending}
                className="flex-1"
              >
                {(createScriptMutation.isPending || updateScriptMutation.isPending) 
                  ? "Saving..." 
                  : selectedScriptId 
                    ? "Update Script" 
                    : "Create Script"}
              </Button>
              <Button variant="secondary" onClick={() => {
                setScriptName("");
                setDescription("");
                setScriptContent("");
                setSelectedScriptId(null);
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