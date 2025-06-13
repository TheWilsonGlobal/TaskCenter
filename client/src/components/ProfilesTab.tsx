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
  const [profileName, setProfileName] = useState("profile_custom.json");
  const [browser, setBrowser] = useState("Chrome");
  const [width, setWidth] = useState("1920");
  const [height, setHeight] = useState("1080");
  const [userAgent, setUserAgent] = useState("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
  const [headless, setHeadless] = useState(true);
  const [devtools, setDevtools] = useState(false);
  
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
    setProfileName("profile_custom.json");
    setBrowser("Chrome");
    setWidth("1920");
    setHeight("1080");
    setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
    setHeadless(true);
    setDevtools(false);
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

    if (!profileName.endsWith('.json')) {
      toast({
        title: "Invalid profile name",
        description: "Profile name must end with .json",
        variant: "destructive",
      });
      return;
    }

    const profileConfig = {
      browser,
      width: parseInt(width),
      height: parseInt(height),
      userAgent,
      headless,
      devtools,
    };

    const profileData = {
      filename: profileName,
      content: JSON.stringify(profileConfig, null, 2),
      browser,
      width: parseInt(width),
      height: parseInt(height),
      headless,
      devtools,
    };

    createProfileMutation.mutate(profileData);
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
    if (profile.width && profile.width <= 500) return <Smartphone className="text-success h-5 w-5" />;
    if (profile.width && profile.width <= 1024) return <Tablet className="text-success h-5 w-5" />;
    return <UserCog className="text-success h-5 w-5" />;
  };

  const getDeviceType = (profile: Profile) => {
    if (profile.width && profile.width <= 500) return "Mobile";
    if (profile.width && profile.width <= 1024) return "Tablet";
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
                            {getDeviceType(profile)} • {profile.browser} • {profile.width}x{profile.height}
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
                        <Button variant="ghost" size="sm" title="Edit">
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
            <h3 className="text-lg font-medium text-slate-900">Profile Configuration</h3>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Profile Name</label>
                <Input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="profile_custom.json"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Browser</label>
                <Select value={browser} onValueChange={setBrowser}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chrome">Chrome</SelectItem>
                    <SelectItem value="Firefox">Firefox</SelectItem>
                    <SelectItem value="Safari">Safari</SelectItem>
                    <SelectItem value="Edge">Edge</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Width</label>
                  <Input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Height</label>
                  <Input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">User Agent</label>
                <Textarea
                  value={userAgent}
                  onChange={(e) => setUserAgent(e.target.value)}
                  className="h-20"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="headless"
                    checked={headless}
                    onCheckedChange={(checked) => setHeadless(checked as boolean)}
                  />
                  <label htmlFor="headless" className="text-sm text-slate-700">
                    Run in headless mode
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="devtools"
                    checked={devtools}
                    onCheckedChange={(checked) => setDevtools(checked as boolean)}
                  />
                  <label htmlFor="devtools" className="text-sm text-slate-700">
                    Open DevTools
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={createProfileMutation.isPending}
                  className="flex-1"
                >
                  {createProfileMutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
                <Button variant="secondary" onClick={resetForm}>
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
