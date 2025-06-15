import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UserCog, Smartphone, Tablet, Download, Edit, Trash2, Plus } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import type { Profile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function ProfilesTab() {
  const [profileName, setProfileName] = useState("profile_custom");
  const [name, setName] = useState("Custom Profile");
  const [description, setDescription] = useState("New browser profile");
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
  const [scriptSource, setScriptSource] = useState("editor");
  const [customScript, setCustomScript] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  
  const { toast } = useToast();

  const { data: profiles = [], isLoading } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
  });

  const createProfileMutation = useMutation({
    mutationFn: (profileData: any) => apiRequest("POST", "/api/profiles", profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      resetForm();
      toast({
        title: "Success",
        description: "Profile created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, profileData }: { id: number; profileData: any }) => 
      apiRequest("PUT", `/api/profiles/${id}`, profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      resetForm();
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/profiles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      toast({
        title: "Success",
        description: "Profile deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete profile",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setProfileName("profile_custom");
    setName("Custom Profile");
    setDescription("New browser profile");
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
    setScriptSource("editor");
    setCustomScript("");
    setSelectedProfileId(null);
  };

  const loadProfileData = (profile: Profile) => {
    // Parse the profile content to get the configuration
    try {
      const profileConfig = JSON.parse(profile.content);
      
      setProfileName(profile.filename.replace('.json', ''));
      setName(profile.name || profileConfig.name || "Custom Profile");
      setDescription(profile.description || profileConfig.description || "");
      setUserAgent(profile.userAgent || profileConfig.userAgent || "chrome-linux");
      setCustomUserAgent(profile.customUserAgent || profileConfig.customUserAgent || "");
      setViewportWidth(String(profile.viewportWidth || profileConfig.viewportWidth || 1920));
      setViewportHeight(String(profile.viewportHeight || profileConfig.viewportHeight || 1080));
      setTimezone(profile.timezone || profileConfig.timezone || "America/New_York");
      setLanguage(profile.language || profileConfig.language || "en-US");
      setUseProxy(profile.useProxy || profileConfig.useProxy || false);
      setProxyType(profile.proxyType || profileConfig.proxyType || "http");
      setProxyHost(profile.proxyHost || profileConfig.proxyHost || "");
      setProxyPort(profile.proxyPort || profileConfig.proxyPort || "");
      setProxyUsername(profile.proxyUsername || profileConfig.proxyUsername || "");
      setProxyPassword(profile.proxyPassword || profileConfig.proxyPassword || "");
      setScriptSource(profile.scriptSource || profileConfig.scriptSource || "editor");
      setCustomScript(profile.customScript || profileConfig.customScript || "");
      setSelectedProfileId(profile.id);
      
      toast({
        title: "Profile loaded",
        description: `${profile.filename} configuration loaded for editing`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile configuration",
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = () => {
    if (!profileName.trim()) {
      toast({
        title: "Invalid profile name",
        description: "Profile name is required",
        variant: "destructive",
      });
      return;
    }

    // Automatically add .json extension if not present
    const finalProfileName = profileName.endsWith('.json') ? profileName : `${profileName}.json`;

    const profileConfig = {
      id: selectedProfileId ? `profile_${selectedProfileId}` : `profile_${Date.now()}`,
      name,
      description,
      userAgent,
      customUserAgent,
      viewportWidth: parseInt(viewportWidth),
      viewportHeight: parseInt(viewportHeight),
      timezone,
      language,
      useProxy,
      proxyType,
      proxyHost,
      proxyPort,
      proxyUsername,
      proxyPassword,
      scriptSource,
      customScript,
      created: selectedProfileId ? undefined : new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    const profileData = {
      profileId: profileConfig.id,
      name,
      description,
      filename: finalProfileName,
      content: JSON.stringify(profileConfig, null, 2),
      userAgent,
      customUserAgent,
      viewportWidth: parseInt(viewportWidth),
      viewportHeight: parseInt(viewportHeight),
      timezone,
      language,
      useProxy,
      proxyType,
      proxyHost,
      proxyPort,
      proxyUsername,
      proxyPassword,
      scriptSource,
      customScript,
    };

    if (selectedProfileId) {
      // Update existing profile
      updateProfileMutation.mutate({ id: selectedProfileId, profileData });
    } else {
      // Create new profile
      createProfileMutation.mutate(profileData);
    }
  };

  const handleDownload = async (profile: Profile) => {
    try {
      const response = await fetch(`/api/profiles/${profile.id}/download`, {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = profile.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download profile",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this profile?")) {
      deleteProfileMutation.mutate(id);
    }
  };

  const getDeviceIcon = (profile: Profile) => {
    if (profile.viewportWidth && profile.viewportWidth <= 500) return <Smartphone className="text-success h-5 w-5" />;
    if (profile.viewportWidth && profile.viewportWidth <= 1024) return <Tablet className="text-success h-5 w-5" />;
    return <UserCog className="text-success h-5 w-5" />;
  };

  const getDeviceType = (profile: Profile) => {
    if (profile.viewportWidth && profile.viewportWidth <= 500) return "Mobile";
    if (profile.viewportWidth && profile.viewportWidth <= 1024) return "Tablet";
    return "Desktop";
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
    return <div className="flex items-center justify-center h-64">Loading profiles...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Profiles List */}
      <div>
        <Card>
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">Profile Configurations</h3>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                New Profile
              </Button>
            </div>
          </div>
          <CardContent className="p-6">
            {profiles.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                No profiles created yet. Create your first browser profile to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {profiles.map((profile) => (
                  <div key={profile.id} className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          {getDeviceIcon(profile)}
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">{profile.filename}</h4>
                          <p className="text-sm text-slate-500">
                            {getDeviceType(profile)} • {profile.userAgent || 'chrome-linux'} • {profile.viewportWidth}x{profile.viewportHeight}
                          </p>
                          <p className="text-sm text-slate-400">
                            Modified {formatDate(profile.updatedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDownload(profile)}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => loadProfileData(profile)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(profile.id)}
                          disabled={deleteProfileMutation.isPending}
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

      {/* Profile Editor */}
      <div>
        <Card>
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">
                {selectedProfileId ? "Edit Profile Configuration" : "Profile Configuration"}
              </h3>
              {selectedProfileId && (
                <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                  Editing
                </div>
              )}
            </div>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Profile Name</label>
                <Input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="profile_custom"
                />
                <p className="text-xs text-slate-500 mt-1">The .json extension will be added automatically</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Display Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Custom Profile"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="New browser profile"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">User Agent</label>
                <Select value={userAgent} onValueChange={setUserAgent}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chrome-linux">Chrome Linux</SelectItem>
                    <SelectItem value="chrome-windows">Chrome Windows</SelectItem>
                    <SelectItem value="firefox-linux">Firefox Linux</SelectItem>
                    <SelectItem value="safari-mac">Safari Mac</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Custom User Agent</label>
                <Textarea
                  value={customUserAgent}
                  onChange={(e) => setCustomUserAgent(e.target.value)}
                  placeholder="Optional custom user agent string"
                  className="h-16"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Viewport Width</label>
                  <Input
                    type="number"
                    value={viewportWidth}
                    onChange={(e) => setViewportWidth(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Viewport Height</label>
                  <Input
                    type="number"
                    value={viewportHeight}
                    onChange={(e) => setViewportHeight(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                  <Input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="America/New_York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                  <Input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="en-US"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="useProxy"
                    checked={useProxy}
                    onCheckedChange={(checked) => setUseProxy(checked as boolean)}
                  />
                  <label htmlFor="useProxy" className="text-sm text-slate-700">
                    Use Proxy
                  </label>
                </div>

                {useProxy && (
                  <div className="space-y-3 ml-6 p-3 bg-slate-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Proxy Type</label>
                        <Select value={proxyType} onValueChange={setProxyType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="http">HTTP</SelectItem>
                            <SelectItem value="https">HTTPS</SelectItem>
                            <SelectItem value="socks5">SOCKS5</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Proxy Host</label>
                        <Input
                          type="text"
                          value={proxyHost}
                          onChange={(e) => setProxyHost(e.target.value)}
                          placeholder="proxy.example.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Proxy Port</label>
                        <Input
                          type="text"
                          value={proxyPort}
                          onChange={(e) => setProxyPort(e.target.value)}
                          placeholder="8080"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                        <Input
                          type="text"
                          value={proxyUsername}
                          onChange={(e) => setProxyUsername(e.target.value)}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                      <Input
                        type="password"
                        value={proxyPassword}
                        onChange={(e) => setProxyPassword(e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
                  className="flex-1"
                >
                  {(createProfileMutation.isPending || updateProfileMutation.isPending) 
                    ? "Saving..." 
                    : selectedProfileId 
                      ? "Update Profile" 
                      : "Save Profile"}
                </Button>
                <Button variant="secondary" onClick={resetForm}>
                  {selectedProfileId ? "Cancel Edit" : "Reset"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
