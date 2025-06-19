import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Code, Download, Edit, Trash2, Plus, Upload } from "lucide-react";
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
  const { toast } = useToast();

  const { data: scripts = [], isLoading } = useQuery<Script[]>({
    queryKey: ["/api/scripts"],
  });

  const createScriptMutation = useMutation({
    mutationFn: (scriptData: any) => apiRequest("POST", "/api/scripts", scriptData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
      resetForm();
      toast({
        title: "Success",
        description: "Script created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create script",
        variant: "destructive",
      });
    },
  });

  const updateScriptMutation = useMutation({
    mutationFn: ({ id, scriptData }: { id: number; scriptData: any }) => 
      apiRequest("PUT", `/api/scripts/${id}`, scriptData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
      resetForm();
      toast({
        title: "Success",
        description: "Script updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update script",
        variant: "destructive",
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
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete script",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setScriptName("New Script");
    setDescription("New script file");
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
    
    toast({
      title: "Script loaded",
      description: `${script.name} loaded for editing`,
    });
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

    if (!scriptContent.trim()) {
      toast({
        title: "Invalid script content",
        description: "Script content cannot be empty",
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
      // Update existing script
      updateScriptMutation.mutate({ id: selectedScriptId, scriptData });
    } else {
      // Create new script
      createScriptMutation.mutate(scriptData);
    }
    
    setIsEditorOpen(false);
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
      a.download = `${script.name}.js`;
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

    if (!file.name.endsWith('.ts') && !file.name.endsWith('.js')) {
      toast({
        title: "Invalid file type",
        description: "Only .ts and .js files are allowed",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const fileName = file.name.replace(/\.(js|ts)$/, '');
      
      setScriptName(fileName);
      setScriptContent(content);
      setDescription(`Imported from ${file.name}`);
      setSelectedScriptId(null);
      
      toast({
        title: "Script imported",
        description: `${file.name} has been loaded for editing`,
      });
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes < 1 ? "Just now" : `${minutes} mins ago`;
      }
      return `${hours} hours ago`;
    }
    return `${days} days ago`;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading scripts...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Scripts List */}
      <div className="lg:col-span-2">
        <Card>
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">Script Files</h3>
              <div className="flex space-x-2">
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
                  Import Script
                </Button>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Script
                </Button>
              </div>
            </div>
          </div>
          <CardContent className="p-0">
            {scripts.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                No scripts available. Scripts will appear here when they are added to the system.
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
                  {scripts.map((script) => (
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
      </div>

      {/* Script Editor */}
      <div className="lg:col-span-3">
        <Card>
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">
                {selectedScriptId ? "Edit Script" : "Script Editor"}
              </h3>
              {selectedScriptId && (
                <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                  Editing
                </div>
              )}
            </div>
          </div>
          <CardContent className="p-6">
            {!selectedScriptId && scriptName === "" ? (
              <div className="text-center text-slate-500 py-8">
                Select a script from the list to edit or click "New Script" to create one.
              </div>
            ) : (
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
                  <Textarea
                    value={scriptContent}
                    onChange={(e) => setScriptContent(e.target.value)}
                    placeholder="// Script source code will appear here"
                    className="h-64 font-mono text-sm"
                  />
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
                  }}>
                    {selectedScriptId ? "Cancel Edit" : "Reset"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
