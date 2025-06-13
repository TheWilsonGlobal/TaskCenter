import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Play, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const apiEndpoints = [
  {
    method: "GET",
    path: "/api/tasks",
    description: "Retrieve all tasks",
    example: null,
  },
  {
    method: "POST",
    path: "/api/tasks",
    description: "Create a new task",
    example: {
      workerId: "worker-01",
      profile: "profile_default.json",
      script: "scraper.ts",
      status: "READY",
      respond: "",
    },
  },
  {
    method: "PUT",
    path: "/api/tasks/:id",
    description: "Update a task",
    example: {
      status: "RUNNING",
      respond: "Task started successfully",
    },
  },
  {
    method: "DELETE",
    path: "/api/tasks/:id",
    description: "Delete a task",
    example: null,
  },
  {
    method: "GET",
    path: "/api/scripts",
    description: "Retrieve all scripts",
    example: null,
  },
  {
    method: "POST",
    path: "/api/scripts",
    description: "Upload a new script",
    example: {
      filename: "new_script.ts",
      content: "// TypeScript content here",
      description: "A new automation script",
    },
  },
  {
    method: "DELETE",
    path: "/api/scripts/:id",
    description: "Delete a script",
    example: null,
  },
  {
    method: "GET",
    path: "/api/profiles",
    description: "Retrieve all profiles",
    example: null,
  },
  {
    method: "POST",
    path: "/api/profiles",
    description: "Create a new profile",
    example: {
      filename: "profile_custom.json",
      content: '{"browser": "Chrome", "width": 1920, "height": 1080}',
      browser: "Chrome",
      width: 1920,
      height: 1080,
      headless: true,
      devtools: false,
    },
  },
  {
    method: "DELETE",
    path: "/api/profiles/:id",
    description: "Delete a profile",
    example: null,
  },
];

export default function ApiTab() {
  const [selectedMethod, setSelectedMethod] = useState("GET");
  const [endpoint, setEndpoint] = useState("/api/tasks");
  const [requestBody, setRequestBody] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getMethodBadgeClass = (method: string) => {
    const classes = {
      GET: "method-get",
      POST: "method-post",
      PUT: "method-put",
      DELETE: "method-delete",
    };
    return classes[method as keyof typeof classes] || "method-get";
  };

  const handleEndpointClick = (apiEndpoint: typeof apiEndpoints[0]) => {
    setSelectedMethod(apiEndpoint.method);
    setEndpoint(apiEndpoint.path);
    if (apiEndpoint.example) {
      setRequestBody(JSON.stringify(apiEndpoint.example, null, 2));
    } else {
      setRequestBody("");
    }
    setResponse("");
  };

  const handleSendRequest = async () => {
    setIsLoading(true);
    setResponse("");

    try {
      const url = endpoint.replace(/:id/, "1"); // Replace :id with 1 for testing
      const options: RequestInit = {
        method: selectedMethod,
        credentials: "include",
        headers: {},
      };

      if (requestBody.trim() && (selectedMethod === "POST" || selectedMethod === "PUT")) {
        options.headers = { "Content-Type": "application/json" };
        options.body = requestBody;
      }

      const res = await fetch(url, options);
      const contentType = res.headers.get("content-type");
      
      let responseData;
      if (contentType && contentType.includes("application/json")) {
        responseData = await res.json();
      } else {
        responseData = await res.text();
      }

      const responseObj = {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data: responseData,
      };

      setResponse(JSON.stringify(responseObj, null, 2));

      if (res.ok) {
        toast({
          title: "Request successful",
          description: `${selectedMethod} ${endpoint} returned ${res.status}`,
        });
      } else {
        toast({
          title: "Request failed",
          description: `${selectedMethod} ${endpoint} returned ${res.status}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorResponse = {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
      setResponse(JSON.stringify(errorResponse, null, 2));
      
      toast({
        title: "Request error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* API Endpoints List */}
      <div>
        <Card>
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-medium text-slate-900">API Endpoints</h3>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              {apiEndpoints.map((apiEndpoint, index) => (
                <div key={index} className="api-endpoint p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Badge className={getMethodBadgeClass(apiEndpoint.method)}>
                        {apiEndpoint.method}
                      </Badge>
                      <code className="text-sm text-slate-600">{apiEndpoint.path}</code>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEndpointClick(apiEndpoint)}
                      title="Test Endpoint"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-slate-500">{apiEndpoint.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Tester */}
      <div>
        <Card>
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-medium text-slate-900">API Tester</h3>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Method</label>
                <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Endpoint</label>
                <Input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="/api/tasks"
                />
              </div>

              {(selectedMethod === "POST" || selectedMethod === "PUT") && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Request Body (JSON)</label>
                  <Textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    placeholder='{"key": "value"}'
                    className="h-32 font-mono text-sm"
                  />
                </div>
              )}

              <Button 
                onClick={handleSendRequest}
                disabled={isLoading}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? "Sending..." : "Send Request"}
              </Button>
            </div>

            {response && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Response</label>
                <div className="bg-slate-50 rounded-lg p-4 border">
                  <pre className="text-sm text-slate-600 font-mono whitespace-pre-wrap overflow-x-auto">
                    {response}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
