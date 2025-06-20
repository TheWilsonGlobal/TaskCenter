import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Monitor, Smartphone, Tablet, Globe, Lock, Edit, Trash2, Download, Upload, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Profile, InsertProfile } from "@/../../shared/schema";

export default function ProfilesTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [profileName, setProfileName] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [userAgent, setUserAgent] = useState("chrome-linux");
  const [customUserAgent, setCustomUserAgent] = useState("");
  const [viewportWidth, setViewportWidth] = useState("1920");
  const [viewportHeight, setViewportHeight] = useState("1080");
  const [timezone, setTimezone] = useState("America/New_York");
  const [language, setLanguage] = useState("en-US");
  const [useProxy, setUseProxy] = useState(false);
  const [proxyType, setProxyType] = useState("http");
  const [proxyHost, setProxyHost] = useState("");
  const [proxyPort, setProxyPort] = useState("");
  const [proxyUsername, setProxyUsername] = useState("");
  const [proxyPassword, setProxyPassword] = useState("");

  const [customField, setCustomField] = useState("{}");

  // Queries
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["/api/profiles"],
  });

  // Mutations
  const createProfileMutation = useMutation({
    mutationFn: async (profileData: InsertProfile) => {
      return apiRequest("/api/profiles", "POST", profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      resetForm();
      setIsEditorOpen(false);
      toast({
        title: "Profile created",
        description: "Browser profile has been created successfully",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, profileData }: { id: number; profileData: Partial<InsertProfile> }) => {
      return apiRequest(`/api/profiles/${id}`, "PUT", profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      resetForm();
      setIsEditorOpen(false);
      toast({
        title: "Profile updated",
        description: "Browser profile has been updated successfully",
      });
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/profiles/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      toast({
        title: "Profile deleted",
        description: "Browser profile has been deleted successfully",
      });
    },
  });

  // Helper Functions
  const resetForm = () => {
    setProfileName("");
    setName("");
    setDescription("");
    setUserAgent("chrome-linux");
    setCustomUserAgent("");
    setViewportWidth("1920");
    setViewportHeight("1080");
    setTimezone("America/New_York");
    setLanguage("en-US");
    setUseProxy(false);
    setProxyType("http");
    setProxyHost("");
    setProxyPort("");
    setProxyUsername("");
    setProxyPassword("");
    setCustomField("{}");
    setSelectedProfileId(null);
    setIsEditorOpen(true);
  };

  const loadProfileData = (profile: Profile) => {
    setProfileName(profile.name);
    setName(profile.name || "Custom Profile");
    setDescription(profile.description || "");
    setUserAgent(profile.userAgent || "chrome-linux");
    setCustomUserAgent(profile.customUserAgent || "");
    setViewportWidth(String(profile.viewportWidth || 1920));
    setViewportHeight(String(profile.viewportHeight || 1080));
    setTimezone(profile.timezone || "America/New_York");
    setLanguage(profile.language || "en-US");
    setUseProxy(profile.useProxy || false);
    setProxyType(profile.proxyType || "http");
    setProxyHost(profile.proxyHost || "");
    setProxyPort(profile.proxyPort || "");
    setProxyUsername(profile.proxyUsername || "");
    setProxyPassword(profile.proxyPassword || "");

    // Handle custom field - convert object back to JSON string for editing
    let customFieldString = "{}";
    if (profile.customField) {
      if (typeof profile.customField === 'object') {
        // Pretty format the JSON object
        customFieldString = JSON.stringify(profile.customField, null, 2);
      } else if (typeof profile.customField === 'string') {
        try {
          // Try to parse and reformat if it's a JSON string
          const parsed = JSON.parse(profile.customField);
          customFieldString = JSON.stringify(parsed, null, 2);
        } catch {
          // If parsing fails, use the string as is
          customFieldString = profile.customField;
        }
      }
    }
    setCustomField(customFieldString);
    setSelectedProfileId(profile.id);
    setIsEditorOpen(true);
    
    toast({
      title: "Profile loaded",
      description: `${profile.name} configuration loaded for editing`,
    });
  };

  const handleSaveProfile = () => {
    if (!name.trim()) {
      toast({
        title: "Profile name required",
        description: "Please enter a profile name",
        variant: "destructive",
      });
      return;
    }

    try {
      const customFields = JSON.parse(customField);
      
      const profileData = {
        name: name.trim(),
        description: description.trim(),
        userAgent,
        customUserAgent: customUserAgent.trim(),
        viewportWidth: parseInt(viewportWidth) || 1920,
        viewportHeight: parseInt(viewportHeight) || 1080,
        timezone,
        language,
        useProxy,
        proxyType,
        proxyHost: proxyHost.trim(),
        proxyPort: proxyPort.trim(),
        proxyUsername: proxyUsername.trim(),
        proxyPassword: proxyPassword.trim(),
        customField
      };

      if (selectedProfileId) {
        updateProfileMutation.mutate({ id: selectedProfileId, profileData });
      } else {
        createProfileMutation.mutate(profileData);
      }
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Custom fields must be valid JSON",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProfile = async (profileId: number) => {
    deleteProfileMutation.mutate(profileId);
  };

  const handleDownload = async (profile: Profile) => {
    try {
      const response = await fetch(`/api/profiles/${profile.id}/download`);
      if (!response.ok) throw new Error("Failed to download");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${profile.name}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download profile file",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await createProfileMutation.mutateAsync(formData as any);
    } catch (error) {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      toast({
        title: "Upload failed",
        description: "Failed to upload profile file",
        variant: "destructive",
      });
    }
  };

  const getDeviceIcon = (profile: Profile) => {
    const width = profile.viewportWidth || 1920;
    if (width <= 480) return <Smartphone className="w-4 h-4" />;
    if (width <= 768) return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const filteredProfiles = Array.isArray(profiles) 
    ? profiles.filter((profile: Profile) =>
        profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (profile.description && profile.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profile Configurations</h2>
          <p className="text-muted-foreground">
            Manage browser profiles for automation tasks
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search profiles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
          <Button onClick={() => { resetForm(); setIsEditorOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            New Profile
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="text-muted-foreground">Loading profiles...</div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Profile Files</CardTitle>
            <CardDescription>
              Browser automation profiles ({filteredProfiles.length} total)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Viewport</TableHead>
                  <TableHead>User Agent</TableHead>
                  <TableHead>Proxy</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile: Profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-mono text-sm">{profile.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(profile)}
                        <span className="font-medium">{profile.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {profile.description || "No description"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {profile.viewportWidth}x{profile.viewportHeight}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {profile.userAgent}
                    </TableCell>
                    <TableCell>
                      {profile.useProxy ? (
                        <Badge variant="outline">
                          <Lock className="w-3 h-3 mr-1" />
                          Enabled
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadProfileData(profile)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(profile)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Profile</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{profile.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteProfile(profile.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredProfiles.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "No profiles match your search" : "No profiles found"}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Profile Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {selectedProfileId ? "Edit Profile" : "New Profile"}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="browser">Browser</TabsTrigger>
                  <TabsTrigger value="proxy">Proxy</TabsTrigger>
                  <TabsTrigger value="custom-field">Custom Field</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Profile Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter profile name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Profile description"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="browser" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userAgent">User Agent</Label>
                      <Select value={userAgent} onValueChange={setUserAgent}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chrome-linux">Chrome Linux</SelectItem>
                          <SelectItem value="chrome-windows">Chrome Windows</SelectItem>
                          <SelectItem value="chrome-mac">Chrome Mac</SelectItem>
                          <SelectItem value="firefox">Firefox</SelectItem>
                          <SelectItem value="safari">Safari</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customUserAgent">Custom User Agent</Label>
                      <Input
                        id="customUserAgent"
                        value={customUserAgent}
                        onChange={(e) => setCustomUserAgent(e.target.value)}
                        placeholder="Custom user agent string"
                        disabled={userAgent !== "custom"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="viewportWidth">Viewport Width</Label>
                      <Input
                        id="viewportWidth"
                        type="number"
                        value={viewportWidth}
                        onChange={(e) => setViewportWidth(e.target.value)}
                        placeholder="1920"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="viewportHeight">Viewport Height</Label>
                      <Input
                        id="viewportHeight"
                        type="number"
                        value={viewportHeight}
                        onChange={(e) => setViewportHeight(e.target.value)}
                        placeholder="1080"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        placeholder="America/New_York"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Input
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        placeholder="en-US"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="proxy" className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="useProxy"
                      checked={useProxy}
                      onCheckedChange={setUseProxy}
                    />
                    <Label htmlFor="useProxy">Enable Proxy</Label>
                  </div>

                  {useProxy && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="proxyType">Proxy Type</Label>
                          <Select value={proxyType} onValueChange={setProxyType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="http">HTTP</SelectItem>
                              <SelectItem value="https">HTTPS</SelectItem>
                              <SelectItem value="socks4">SOCKS4</SelectItem>
                              <SelectItem value="socks5">SOCKS5</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="proxyHost">Proxy Host</Label>
                          <Input
                            id="proxyHost"
                            value={proxyHost}
                            onChange={(e) => setProxyHost(e.target.value)}
                            placeholder="proxy.example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="proxyPort">Proxy Port</Label>
                          <Input
                            id="proxyPort"
                            value={proxyPort}
                            onChange={(e) => setProxyPort(e.target.value)}
                            placeholder="8080"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="proxyUsername">Username</Label>
                          <Input
                            id="proxyUsername"
                            value={proxyUsername}
                            onChange={(e) => setProxyUsername(e.target.value)}
                            placeholder="Username (optional)"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="proxyPassword">Password</Label>
                          <Input
                            id="proxyPassword"
                            type="password"
                            value={proxyPassword}
                            onChange={(e) => setProxyPassword(e.target.value)}
                            placeholder="Password (optional)"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="custom-field" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customField">Custom Field (JSON Format)</Label>
                    <div className="relative">
                      <div className="relative bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors">
                        <pre 
                          className="absolute inset-0 p-4 font-mono text-sm leading-relaxed pointer-events-none overflow-hidden whitespace-pre-wrap break-words"
                          style={{
                            tabSize: 2,
                            fontSize: '13px',
                            lineHeight: '1.6',
                            fontFamily: '"Fira Code", "JetBrains Mono", ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                          }}
                          dangerouslySetInnerHTML={{
                            __html: customField
                              .replace(/&/g, '&amp;')
                              .replace(/</g, '&lt;')
                              .replace(/>/g, '&gt;')
                              .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
                                let cls = 'text-slate-900 dark:text-slate-100';
                                if (/^"/.test(match)) {
                                  if (/:$/.test(match)) {
                                    cls = 'text-blue-600 dark:text-blue-400 font-medium'; // property names
                                  } else {
                                    cls = 'text-green-600 dark:text-green-400'; // string values
                                  }
                                } else if (/true|false/.test(match)) {
                                  cls = 'text-purple-600 dark:text-purple-400 font-medium'; // booleans
                                } else if (/null/.test(match)) {
                                  cls = 'text-red-500 dark:text-red-400 font-medium'; // null
                                } else if (/-?\d+/.test(match)) {
                                  cls = 'text-orange-600 dark:text-orange-400'; // numbers
                                }
                                return `<span class="${cls}">${match}</span>`;
                              })
                              .replace(/([{}])/g, '<span class="text-slate-600 dark:text-slate-400 font-bold">$1</span>') // braces
                              .replace(/([[\]])/g, '<span class="text-slate-600 dark:text-slate-400 font-bold">$1</span>') // brackets
                              .replace(/([:,])/g, '<span class="text-slate-500 dark:text-slate-500">$1</span>') // punctuation
                          }}
                        />
                        <Textarea
                          id="customField"
                          value={customField}
                          onChange={(e) => setCustomField(e.target.value)}
                          placeholder='{\n  "key": "value",\n  "account": {\n    "username": "example",\n    "password": "example"\n  }\n}'
                          rows={18}
                          className="relative bg-transparent border-0 p-4 resize-none focus:ring-0 focus:outline-none font-mono text-sm leading-relaxed text-transparent caret-slate-900 dark:caret-slate-100"
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
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className="text-xs bg-white dark:bg-slate-800 shadow-sm">
                          JSON
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <p>
                          Enter custom configuration data in JSON format. Use proper JSON syntax with double quotes for strings.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          try {
                            const parsed = JSON.parse(customField);
                            const formatted = JSON.stringify(parsed, null, 2);
                            setCustomField(formatted);
                            toast({
                              title: "JSON formatted",
                              description: "Your JSON has been properly formatted",
                            });
                          } catch (error) {
                            toast({
                              title: "Invalid JSON",
                              description: "Please check your JSON syntax",
                              variant: "destructive",
                            });
                          }
                        }}
                        className="text-xs"
                      >
                        Format JSON
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile}>
              {selectedProfileId ? "Update Profile" : "Create Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}