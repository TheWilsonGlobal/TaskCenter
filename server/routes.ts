import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertScriptSchema, insertProfileSchema, insertWorkerSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Task routes
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid task data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.put("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(id, validatedData);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid task data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTask(id);
      if (!success) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Get profile for a specific task
  app.get("/api/tasks/:id/profile", async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      const profile = await storage.getProfile(task.profileId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found for this task" });
      }
      
      let parsedCustomField = {};
      try {
        parsedCustomField = profile.customField ? JSON.parse(profile.customField) : {};
      } catch (error) {
        console.error('Error parsing custom field for profile', profile.id, error);
        parsedCustomField = {};
      }
      const profileWithParsedCustomField = {
        ...profile,
        customField: parsedCustomField
      };
      res.json(profileWithParsedCustomField);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task profile" });
    }
  });

  // Get script for a specific task
  app.get("/api/tasks/:id/script", async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      const script = await storage.getScript(task.scriptId);
      if (!script) {
        return res.status(404).json({ error: "Script not found for this task" });
      }
      
      res.json(script);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task script" });
    }
  });

  // Script routes
  app.get("/api/scripts", async (req: Request, res: Response) => {
    try {
      const scripts = await storage.getAllScripts();
      res.json(scripts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scripts" });
    }
  });

  app.get("/api/scripts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const script = await storage.getScript(id);
      if (!script) {
        return res.status(404).json({ error: "Script not found" });
      }
      res.json(script);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch script" });
    }
  });

  app.get("/api/scripts/:id/download", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const script = await storage.getScript(id);
      if (!script) {
        return res.status(404).json({ error: "Script not found" });
      }
      
      res.setHeader('Content-Disposition', `attachment; filename="${script.name}.js"`);
      res.setHeader('Content-Type', 'text/typescript');
      res.send(script.content);
    } catch (error) {
      res.status(500).json({ error: "Failed to download script" });
    }
  });

  app.post("/api/scripts", upload.single('file'), async (req: Request, res: Response) => {
    try {
      let content: string;
      let name: string;
      let description: string = "";

      if (req.file) {
        // File upload
        content = req.file.buffer.toString('utf8');
        const filename = req.file.originalname;
        description = req.body.description || "";
        
        if (!filename.endsWith('.ts') && !filename.endsWith('.js')) {
          return res.status(400).json({ error: "Only .ts and .js files are allowed" });
        }
        name = filename.replace(/\.(js|ts)$/, '');
      } else {
        // JSON data - validate the body
        if (!req.body.name || !req.body.content) {
          return res.status(400).json({ error: "Name and content are required" });
        }
        content = req.body.content;
        name = req.body.name;
        description = req.body.description || "";
      }

      const existingScript = await storage.getScriptByName(name);
      if (existingScript) {
        return res.status(409).json({ error: "Script with this name already exists" });
      }

      const scriptData = {
        name,
        content,
        description,
      };

      const script = await storage.createScript(scriptData);
      res.status(201).json(script);
    } catch (error) {
      console.error("Script creation error:", error);
      res.status(500).json({ error: "Failed to create script" });
    }
  });

  app.put("/api/scripts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertScriptSchema.partial().parse(req.body);
      const script = await storage.updateScript(id, validatedData);
      if (!script) {
        return res.status(404).json({ error: "Script not found" });
      }
      res.json(script);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid script data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update script" });
    }
  });

  app.delete("/api/scripts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteScript(id);
      if (!success) {
        return res.status(404).json({ error: "Script not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete script" });
    }
  });

  // Profile routes
  app.get("/api/profiles", async (req: Request, res: Response) => {
    try {
      const profiles = await storage.getAllProfiles();
      const profilesWithParsedCustomField = profiles.map(profile => {
        let parsedCustomField = {};
        try {
          parsedCustomField = profile.customField ? JSON.parse(profile.customField) : {};
        } catch (error) {
          console.error('Error parsing custom field for profile', profile.id, error);
          parsedCustomField = {};
        }
        return {
          ...profile,
          customField: parsedCustomField
        };
      });
      res.json(profilesWithParsedCustomField);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profiles" });
    }
  });

  app.get("/api/profiles/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const profile = await storage.getProfile(id);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      let parsedCustomField = {};
      try {
        parsedCustomField = profile.customField ? JSON.parse(profile.customField) : {};
      } catch (error) {
        console.error('Error parsing custom field for profile', profile.id, error);
        parsedCustomField = {};
      }
      const profileWithParsedCustomField = {
        ...profile,
        customField: parsedCustomField
      };
      res.json(profileWithParsedCustomField);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.get("/api/profiles/:id/download", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const profile = await storage.getProfile(id);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      
      let parsedCustomField = {};
      try {
        parsedCustomField = profile.customField ? JSON.parse(profile.customField) : {};
      } catch (error) {
        console.error('Error parsing custom field for profile', profile.id, error);
        parsedCustomField = {};
      }
      const profileWithParsedCustomField = {
        ...profile,
        customField: parsedCustomField
      };
      
      res.setHeader('Content-Disposition', `attachment; filename="${profile.name}.json"`);
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(profileWithParsedCustomField, null, 2));
    } catch (error) {
      res.status(500).json({ error: "Failed to download profile" });
    }
  });

  app.post("/api/profiles", upload.single('file'), async (req: Request, res: Response) => {
    try {
      let profileData: any;

      if (req.file) {
        // File upload - parse JSON content
        const content = req.file.buffer.toString('utf8');
        const filename = req.file.originalname;
        
        if (!filename.endsWith('.json')) {
          return res.status(400).json({ error: "Only .json files are allowed" });
        }

        // Validate JSON content
        try {
          profileData = JSON.parse(content);
        } catch {
          return res.status(400).json({ error: "Invalid JSON content" });
        }

        const name = filename.replace('.json', '');
        const existingProfile = await storage.getProfileByName(name);
        if (existingProfile) {
          return res.status(409).json({ error: "Profile with this name already exists" });
        }

        profileData.name = name;
        profileData.description = profileData.description || `Profile file: ${filename}`;
      } else {
        // JSON data from form
        profileData = req.body;
      }

      const validatedData = insertProfileSchema.parse({
        name: profileData.name,
        description: profileData.description || "New browser profile",
        userAgent: profileData.userAgent || "chrome-linux",
        customUserAgent: profileData.customUserAgent || "",
        viewportWidth: parseInt(profileData.viewportWidth) || 1920,
        viewportHeight: parseInt(profileData.viewportHeight) || 1080,
        timezone: profileData.timezone || "America/New_York",
        language: profileData.language || "en-US",
        useProxy: profileData.useProxy === 'true' || profileData.useProxy === true || false,
        proxyType: profileData.proxyType || "http",
        proxyHost: profileData.proxyHost || "",
        proxyPort: profileData.proxyPort || "",
        proxyUsername: profileData.proxyUsername || "",
        proxyPassword: profileData.proxyPassword || "",
        scriptSource: profileData.scriptSource || "editor",
        customScript: profileData.customScript || "",
        customField: profileData.customField || "{}"
      });

      const profile = await storage.createProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid profile data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create profile" });
    }
  });

  app.put("/api/profiles/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProfileSchema.partial().parse(req.body);
      const profile = await storage.updateProfile(id, validatedData);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid profile data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.delete("/api/profiles/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProfile(id);
      if (!success) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete profile" });
    }
  });

  // Worker routes
  app.get("/api/workers", async (req: Request, res: Response) => {
    try {
      const workers = await storage.getAllWorkers();
      res.json(workers);
    } catch (error) {
      console.error("Error fetching workers:", error);
      res.status(500).json({ error: "Failed to fetch workers" });
    }
  });

  app.get("/api/workers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const worker = await storage.getWorker(id);
      
      if (!worker) {
        return res.status(404).json({ error: "Worker not found" });
      }
      
      res.json(worker);
    } catch (error) {
      console.error("Error fetching worker:", error);
      res.status(500).json({ error: "Failed to fetch worker" });
    }
  });

  app.post("/api/workers", async (req: Request, res: Response) => {
    try {
      const validatedData = insertWorkerSchema.parse(req.body);
      const worker = await storage.createWorker(validatedData);
      res.status(201).json(worker);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid worker data", details: error.errors });
      }
      console.error("Error creating worker:", error);
      res.status(500).json({ error: "Failed to create worker" });
    }
  });

  app.put("/api/workers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertWorkerSchema.partial().parse(req.body);
      const worker = await storage.updateWorker(id, validatedData);
      
      if (!worker) {
        return res.status(404).json({ error: "Worker not found" });
      }
      
      res.json(worker);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid worker data", details: error.errors });
      }
      console.error("Error updating worker:", error);
      res.status(500).json({ error: "Failed to update worker" });
    }
  });

  app.delete("/api/workers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteWorker(id);
      
      if (!success) {
        return res.status(404).json({ error: "Worker not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting worker:", error);
      res.status(500).json({ error: "Failed to delete worker" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
