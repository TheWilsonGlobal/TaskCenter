import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Code, Download, Edit, Trash2, CloudUpload } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState, useRef } from "react";
import type { Script } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function ScriptsTab() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scriptName, setScriptName] = useState("");
  const [description, setDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: scripts = [], isLoading } = useQuery<Script[]>({
    queryKey: ["/api/scripts"],
  });

  const uploadScriptMutation = useMutation({
    mutationFn: (formData: FormData) => apiRequest("POST", "/api/scripts", formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
      setSelectedFile(null);
      setScriptName("");
      setDescription("");
      toast({
        title: "Success",
        description: "Script uploaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload script",
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

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.name.endsWith('.ts') && !file.name.endsWith('.js')) {
      toast({
        title: "Invalid file type",
        description: "Only .ts and .js files are allowed",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
    setScriptName(file.name);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a .ts or .js file to upload",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('description', description);
    
    uploadScriptMutation.mutate(formData);
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
      a.download = script.filename;
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Scripts List */}
      <div className="lg:col-span-2">
        <Card>
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">Script Files</h3>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Script
              </Button>
            </div>
          </div>
          <CardContent className="p-6">
            {scripts.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                No scripts uploaded yet. Upload your first TypeScript script to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {scripts.map((script) => (
                  <div key={script.id} className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Code className="text-primary h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">{script.filename}</h4>
                          <p className="text-sm text-slate-500">
                            Modified {formatDate(script.updatedAt)} • {formatFileSize(script.size)}
                          </p>
                          {script.description && (
                            <p className="text-sm text-slate-600 mt-1">{script.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDownload(script)}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Edit">
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upload Area */}
      <div className="lg:col-span-1">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Upload New Script</h3>
            
            <div
              className={`upload-area ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center">
                <CloudUpload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <p className="text-slate-600 mb-2">Drag & drop your .ts or .js file here</p>
                <p className="text-sm text-slate-500">or click to browse</p>
                {selectedFile && (
                  <p className="text-sm text-primary mt-2 font-medium">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".ts,.js"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Script Name</label>
                <Input
                  type="text"
                  value={scriptName}
                  onChange={(e) => setScriptName(e.target.value)}
                  placeholder="Enter script name"
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
              
              <Button 
                onClick={handleUpload}
                disabled={!selectedFile || uploadScriptMutation.isPending}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadScriptMutation.isPending ? "Uploading..." : "Upload Script"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
