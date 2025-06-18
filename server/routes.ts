import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertScriptSchema, insertProfileSchema } from "@shared/schema";
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
      
      const profile = await storage.getProfileByName(task.profile);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found for this task" });
      }
      
      res.json(profile);
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
      
      const script = await storage.getScriptByName(task.script);
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
      let filename: string;
      let description: string = "";

      if (req.file) {
        // File upload
        content = req.file.buffer.toString('utf8');
        filename = req.file.originalname;
        description = req.body.description || "";
      } else {
        // JSON data - validate the body
        if (!req.body.filename || !req.body.content) {
          return res.status(400).json({ error: "Filename and content are required" });
        }
        content = req.body.content;
        filename = req.body.filename;
        description = req.body.description || "";
      }

      if (!filename.endsWith('.ts') && !filename.endsWith('.js')) {
        return res.status(400).json({ error: "Only .ts and .js files are allowed" });
      }

      const name = filename.replace(/\.(js|ts)$/, '');
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
      res.json(profiles);
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
      res.json(profile);
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
      
      res.setHeader('Content-Disposition', `attachment; filename="${profile.name}.json"`);
      res.setHeader('Content-Type', 'application/json');
      res.send(profile.content);
    } catch (error) {
      res.status(500).json({ error: "Failed to download profile" });
    }
  });

  app.post("/api/profiles", upload.single('file'), async (req: Request, res: Response) => {
    try {
      let content: string;
      let filename: string;

      if (req.file) {
        // File upload
        content = req.file.buffer.toString('utf8');
        filename = req.file.originalname;
      } else {
        // JSON data
        const validatedData = insertProfileSchema.parse(req.body);
        content = validatedData.content;
        filename = `${validatedData.name}.json`;
      }

      if (!filename.endsWith('.json')) {
        return res.status(400).json({ error: "Only .json files are allowed" });
      }

      // Validate JSON content
      try {
        JSON.parse(content);
      } catch {
        return res.status(400).json({ error: "Invalid JSON content" });
      }

      const name = filename.replace('.json', '');
      const existingProfile = await storage.getProfileByName(name);
      if (existingProfile) {
        return res.status(409).json({ error: "Profile with this name already exists" });
      }

      const profileData = {
        profileId: req.body.profileId || `profile_${Date.now()}`,
        name: req.body.name || name,
        description: req.body.description || "New browser profile",
        content,
        userAgent: req.body.userAgent || "chrome-linux",
        customUserAgent: req.body.customUserAgent || "",
        viewportWidth: parseInt(req.body.viewportWidth) || parseInt(req.body.width) || 1920,
        viewportHeight: parseInt(req.body.viewportHeight) || parseInt(req.body.height) || 1080,
        timezone: req.body.timezone || "America/New_York",
        language: req.body.language || "en-US",
        useProxy: req.body.useProxy === 'true' || false,
        proxyType: req.body.proxyType || "http",
        proxyHost: req.body.proxyHost || "",
        proxyPort: req.body.proxyPort || "",
        proxyUsername: req.body.proxyUsername || "",
        proxyPassword: req.body.proxyPassword || "",
        scriptSource: req.body.scriptSource || "editor",
        customScript: req.body.customScript || "",
      };

      const profile = await storage.createProfile(profileData);
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

  const httpServer = createServer(app);
  return httpServer;
}
