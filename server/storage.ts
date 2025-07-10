import { tasks, scripts, profiles, workers } from "@shared/schema";
import type { Task, InsertTask, Script, InsertScript, Profile, InsertProfile, Worker, InsertWorker } from "@shared/schema";
import fs from "fs/promises";
import path from "path";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Task methods
  getAllTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Script methods
  getAllScripts(): Promise<Script[]>;
  getScript(id: number): Promise<Script | undefined>;
  getScriptByName(name: string): Promise<Script | undefined>;
  createScript(script: InsertScript): Promise<Script>;
  updateScript(id: number, script: Partial<InsertScript>): Promise<Script | undefined>;
  deleteScript(id: number): Promise<boolean>;
  
  // Profile methods
  getAllProfiles(): Promise<Profile[]>;
  getProfile(id: number): Promise<Profile | undefined>;
  getProfileByName(name: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: number, profile: Partial<InsertProfile>): Promise<Profile | undefined>;
  deleteProfile(id: number): Promise<boolean>;
  
  // Worker methods
  getAllWorkers(): Promise<Worker[]>;
  getWorker(id: number): Promise<Worker | undefined>;
  getWorkerByUsername(username: string): Promise<Worker | undefined>;
  createWorker(worker: InsertWorker): Promise<Worker>;
  updateWorker(id: number, worker: Partial<InsertWorker>): Promise<Worker | undefined>;
  deleteWorker(id: number): Promise<boolean>;
  
  // File system methods
  saveScriptFile(filename: string, content: string): Promise<void>;
  getScriptFile(filename: string): Promise<string>;
  deleteScriptFile(filename: string): Promise<void>;
  saveProfileFile(filename: string, content: string): Promise<void>;
  getProfileFile(filename: string): Promise<string>;
  deleteProfileFile(filename: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private tasks: Map<number, Task>;
  private scripts: Map<number, Script>;
  private profiles: Map<number, Profile>;
  private currentTaskId: number;
  private currentScriptId: number;
  private currentProfileId: number;
  private scriptsDir: string;
  private profilesDir: string;
  private tasksDir: string;

  constructor() {
    this.tasks = new Map();
    this.scripts = new Map();
    this.profiles = new Map();
    this.currentTaskId = 1;
    this.currentScriptId = 1;
    this.currentProfileId = 1;
    this.scriptsDir = path.resolve(process.cwd(), 'scripts');
    this.profilesDir = path.resolve(process.cwd(), 'profiles');
    this.tasksDir = path.resolve(process.cwd(), 'tasks');
    this.initializeDirectories();
    this.loadTasksFromFiles();
  }

  private async initializeDirectories() {
    try {
      await fs.mkdir(this.scriptsDir, { recursive: true });
      await fs.mkdir(this.profilesDir, { recursive: true });
      await fs.mkdir(this.tasksDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }

  private async loadTasksFromFiles() {
    try {
      const files = await fs.readdir(this.tasksDir);
      let maxId = 0;
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.tasksDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const task = JSON.parse(content) as Task;
          this.tasks.set(task.id, task);
          maxId = Math.max(maxId, task.id);
        }
      }
      
      this.currentTaskId = maxId + 1;
    } catch (error) {
      console.error('Error loading tasks from files:', error);
    }
  }

  private async saveTaskToFile(task: Task): Promise<void> {
    try {
      const filePath = path.join(this.tasksDir, `task_${task.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(task, null, 2));
    } catch (error) {
      console.error('Error saving task to file:', error);
      throw error;
    }
  }

  private async deleteTaskFile(taskId: number): Promise<void> {
    try {
      const filePath = path.join(this.tasksDir, `task_${taskId}.json`);
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting task file:', error);
    }
  }

  // Task methods
  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = {
      ...insertTask,
      id,
      status: insertTask.status || "NEW",
      respond: insertTask.respond ?? "",
      profileId: insertTask.profileId ?? null,
      createdAt: new Date().toISOString(),
    };
    this.tasks.set(id, task);
    await this.saveTaskToFile(task);
    return task;
  }

  async updateTask(id: number, updateData: Partial<InsertTask>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;
    
    const updatedTask = { ...existingTask, ...updateData };
    this.tasks.set(id, updatedTask);
    await this.saveTaskToFile(updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const deleted = this.tasks.delete(id);
    if (deleted) {
      await this.deleteTaskFile(id);
    }
    return deleted;
  }

  // Script methods
  async getAllScripts(): Promise<Script[]> {
    try {
      const files = await fs.readdir(this.scriptsDir);
      const scripts: Script[] = [];
      
      for (const file of files) {
        if (file.endsWith('.js') || file.endsWith('.ts')) {
          const filePath = path.join(this.scriptsDir, file);
          const stats = await fs.stat(filePath);
          const content = await fs.readFile(filePath, 'utf-8');
          
          // Check if we have this script in memory, otherwise create a new entry
          const scriptName = file.replace(/\.(js|ts)$/, '');
          const existingScript = Array.from(this.scripts.values()).find(s => s.name === scriptName);
          
          if (existingScript) {
            scripts.push(existingScript);
          } else {
            const script: Script = {
              id: this.currentScriptId++,
              name: scriptName,
              content: content,
              description: `Script file: ${file}`,
              size: content.length,
              createdAt: stats.birthtime.toISOString(),
              updatedAt: stats.mtime.toISOString(),
            };
            this.scripts.set(script.id, script);
            scripts.push(script);
          }
        }
      }
      
      return scripts;
    } catch (error) {
      console.error('Error reading scripts from folder:', error);
      return Array.from(this.scripts.values());
    }
  }

  async getScript(id: number): Promise<Script | undefined> {
    return this.scripts.get(id);
  }

  async getScriptByName(name: string): Promise<Script | undefined> {
    return Array.from(this.scripts.values()).find(script => script.name === name);
  }

  async createScript(insertScript: InsertScript): Promise<Script> {
    const id = this.currentScriptId++;
    const now = new Date().toISOString();
    const script: Script = {
      ...insertScript,
      id,
      description: insertScript.description || "",
      size: insertScript.content.length,
      createdAt: now,
      updatedAt: now,
    };
    this.scripts.set(id, script);
    
    // Save to file system
    await this.saveScriptFile(`${script.name}.js`, script.content);
    
    return script;
  }

  async updateScript(id: number, updateData: Partial<InsertScript>): Promise<Script | undefined> {
    const existingScript = this.scripts.get(id);
    if (!existingScript) return undefined;
    
    const updatedScript = {
      ...existingScript,
      ...updateData,
      size: updateData.content ? updateData.content.length : existingScript.size,
      updatedAt: new Date().toISOString(),
    };
    this.scripts.set(id, updatedScript);
    
    // Update file system
    if (updateData.content) {
      await this.saveScriptFile(`${updatedScript.name}.js`, updateData.content);
    }
    
    return updatedScript;
  }

  async deleteScript(id: number): Promise<boolean> {
    const script = this.scripts.get(id);
    if (!script) return false;
    
    await this.deleteScriptFile(`${script.name}.js`);
    return this.scripts.delete(id);
  }

  // Profile methods
  async getAllProfiles(): Promise<Profile[]> {
    try {
      const files = await fs.readdir(this.profilesDir);
      const profiles: Profile[] = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.profilesDir, file);
          const stats = await fs.stat(filePath);
          const content = await fs.readFile(filePath, 'utf-8');
          
          // Check if we have this profile in memory, otherwise create a new entry
          const profileName = file.replace('.json', '');
          const existingProfile = Array.from(this.profiles.values()).find(p => p.name === profileName);
          
          if (existingProfile) {
            profiles.push(existingProfile);
          } else {
            let parsedContent;
            try {
              parsedContent = JSON.parse(content);
            } catch (error) {
              console.error(`Error parsing profile ${file}:`, error);
              continue;
            }
            
            const profile: Profile = {
              id: this.currentProfileId++,
              name: parsedContent.name || profileName,
              description: parsedContent.description || `Profile file: ${file}`,
              userAgent: parsedContent.userAgent || "chrome-linux",
              customUserAgent: parsedContent.customUserAgent || "",
              viewportWidth: parsedContent.viewportWidth || 1920,
              viewportHeight: parsedContent.viewportHeight || 1080,
              timezone: parsedContent.timezone || "America/New_York",
              language: parsedContent.language || "en-US",
              useProxy: parsedContent.useProxy || false,
              proxyType: parsedContent.proxyType || "http",
              proxyHost: parsedContent.proxyHost || "",
              proxyPort: parsedContent.proxyPort || "",
              proxyUsername: parsedContent.proxyUsername || "",
              proxyPassword: parsedContent.proxyPassword || "",

              customField: parsedContent.custom_fields ? JSON.stringify(parsedContent.custom_fields) : "{}",
              createdAt: stats.birthtime.toISOString(),
              updatedAt: stats.mtime.toISOString(),
            };
            this.profiles.set(profile.id, profile);
            profiles.push(profile);
          }
        }
      }
      
      return profiles;
    } catch (error) {
      console.error('Error reading profiles from folder:', error);
      return Array.from(this.profiles.values());
    }
  }

  async getProfile(id: number): Promise<Profile | undefined> {
    return this.profiles.get(id);
  }

  async getProfileByName(name: string): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(profile => profile.name === name);
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const id = this.currentProfileId++;
    const now = new Date().toISOString();
    const profile: Profile = {
      ...insertProfile,
      id,
      description: insertProfile.description || "",
      userAgent: insertProfile.userAgent || "chrome-linux",
      customUserAgent: insertProfile.customUserAgent || "",
      viewportWidth: insertProfile.viewportWidth || 1920,
      viewportHeight: insertProfile.viewportHeight || 1080,
      timezone: insertProfile.timezone || "America/New_York",
      language: insertProfile.language || "en-US",
      useProxy: insertProfile.useProxy || false,
      proxyType: insertProfile.proxyType || "http",
      proxyHost: insertProfile.proxyHost || "",
      proxyPort: insertProfile.proxyPort || "",
      proxyUsername: insertProfile.proxyUsername || "",
      proxyPassword: insertProfile.proxyPassword || "",

      customField: insertProfile.customField ?? "{}",
      createdAt: now,
      updatedAt: now,
    };
    this.profiles.set(id, profile);
    
    return profile;
  }

  async updateProfile(id: number, updateData: Partial<InsertProfile>): Promise<Profile | undefined> {
    const existingProfile = this.profiles.get(id);
    if (!existingProfile) return undefined;
    
    const updatedProfile = {
      ...existingProfile,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    this.profiles.set(id, updatedProfile);
    
    return updatedProfile;
  }

  async deleteProfile(id: number): Promise<boolean> {
    const profile = this.profiles.get(id);
    if (!profile) return false;
    
    await this.deleteProfileFile(`${profile.name}.json`);
    return this.profiles.delete(id);
  }

  // File system methods
  async saveScriptFile(filename: string, content: string): Promise<void> {
    const filePath = path.join(this.scriptsDir, filename);
    await fs.writeFile(filePath, content, 'utf8');
  }

  async getScriptFile(filename: string): Promise<string> {
    const filePath = path.join(this.scriptsDir, filename);
    return await fs.readFile(filePath, 'utf8');
  }

  async deleteScriptFile(filename: string): Promise<void> {
    const filePath = path.join(this.scriptsDir, filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // File might not exist, ignore error
    }
  }

  async saveProfileFile(filename: string, content: string): Promise<void> {
    const filePath = path.join(this.profilesDir, filename);
    await fs.writeFile(filePath, content, 'utf8');
  }

  async getProfileFile(filename: string): Promise<string> {
    const filePath = path.join(this.profilesDir, filename);
    return await fs.readFile(filePath, 'utf8');
  }

  async deleteProfileFile(filename: string): Promise<void> {
    const filePath = path.join(this.profilesDir, filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // File might not exist, ignore error
    }
  }

  // Worker methods (stub implementation for MemStorage)
  async getAllWorkers(): Promise<Worker[]> {
    return [];
  }

  async getWorker(id: number): Promise<Worker | undefined> {
    return undefined;
  }

  async getWorkerByUsername(username: string): Promise<Worker | undefined> {
    return undefined;
  }

  async createWorker(worker: InsertWorker): Promise<Worker> {
    throw new Error("Worker operations not supported in MemStorage");
  }

  async updateWorker(id: number, worker: Partial<InsertWorker>): Promise<Worker | undefined> {
    return undefined;
  }

  async deleteWorker(id: number): Promise<boolean> {
    return false;
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // Task methods
  async getAllTasks(): Promise<Task[]> {
    const results = await db.query.tasks.findMany({
      with: {
        profile: true,
        script: true,
        worker: true,
      },
    });
    // Ensure all required fields are present and properly typed
    return results.map(task => ({
      ...task,
      profileId: task.profileId ?? null,
      respond: task.respond ?? null,
      status: task.status as Task['status'],
      profile: task.profile || undefined,
      script: task.script,
      worker: task.worker
    }));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, id),
      with: {
        profile: true,
        script: true,
        worker: true,
      },
    });

    if (!task) return undefined;

    // Ensure all required fields are present and properly typed
    return {
      ...task,
      profileId: task.profileId ?? null,
      respond: task.respond ?? null,
      status: task.status as Task['status'],
      profile: task.profile || undefined,
      script: task.script,
      worker: task.worker
    };
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({
        ...insertTask,
        respond: insertTask.respond ?? null,
        status: insertTask.status || 'NEW',
        createdAt: new Date().toISOString(),
      })
      .returning();
    
    // Fetch the full task with relations
    const fullTask = await this.getTask(task.id);
    if (!fullTask) {
      throw new Error('Failed to fetch created task');
    }
    return fullTask;
  }

  async updateTask(id: number, updateData: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({
        ...updateData,
        // Ensure optional fields are properly handled
        respond: updateData.respond ?? undefined,
        profileId: updateData.profileId ?? undefined,
      })
      .where(eq(tasks.id, id))
      .returning();
      
    if (!task) return undefined;
    
    // Fetch the full task with relations
    return this.getTask(task.id);
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return (result?.rowCount ?? 0) > 0;
  }

  // Script methods
  async getAllScripts(): Promise<Script[]> {
    return await db.select().from(scripts);
  }

  async getScript(id: number): Promise<Script | undefined> {
    const [script] = await db.select().from(scripts).where(eq(scripts.id, id));
    return script || undefined;
  }

  async getScriptByName(name: string): Promise<Script | undefined> {
    const [script] = await db.select().from(scripts).where(eq(scripts.name, name));
    return script || undefined;
  }

  async createScript(insertScript: InsertScript): Promise<Script> {
    const now = new Date().toISOString();
    const [script] = await db
      .insert(scripts)
      .values({
        ...insertScript,
        description: insertScript.description || "",
        size: insertScript.content.length,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    
    return script;
  }

  async updateScript(id: number, updateData: Partial<InsertScript>): Promise<Script | undefined> {
    const updatedData = {
      ...updateData,
      size: updateData.content ? updateData.content.length : undefined,
      updatedAt: new Date().toISOString(),
    };

    const [script] = await db
      .update(scripts)
      .set(updatedData)
      .where(eq(scripts.id, id))
      .returning();



    return script || undefined;
  }

  async deleteScript(id: number): Promise<boolean> {
    const script = await this.getScript(id);
    if (!script) return false;

    const result = await db.delete(scripts).where(eq(scripts.id, id));
    
    return (result.rowCount ?? 0) > 0;
  }

  // Profile methods
  async getAllProfiles(): Promise<Profile[]> {
    return await db.select().from(profiles);
  }

  async getProfile(id: number): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile || undefined;
  }

  async getProfileByName(name: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.name, name));
    return profile || undefined;
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const now = new Date().toISOString();
    const [profile] = await db
      .insert(profiles)
      .values({
        name: insertProfile.name,
        description: insertProfile.description || "",
        userAgent: insertProfile.userAgent || "chrome-linux",
        customUserAgent: insertProfile.customUserAgent || "",
        viewportWidth: insertProfile.viewportWidth || 1920,
        viewportHeight: insertProfile.viewportHeight || 1080,
        timezone: insertProfile.timezone || "America/New_York",
        language: insertProfile.language || "en-US",
        useProxy: insertProfile.useProxy || false,
        proxyType: insertProfile.proxyType || "http",
        proxyHost: insertProfile.proxyHost || "",
        proxyPort: insertProfile.proxyPort || "",
        proxyUsername: insertProfile.proxyUsername || "",
        proxyPassword: insertProfile.proxyPassword || "",

        customField: insertProfile.customField || "{}",
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    
    return profile;
  }

  async updateProfile(id: number, updateData: Partial<InsertProfile>): Promise<Profile | undefined> {
    const updatedData = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    const [profile] = await db
      .update(profiles)
      .set(updatedData)
      .where(eq(profiles.id, id))
      .returning();

    return profile || undefined;
  }

  async deleteProfile(id: number): Promise<boolean> {
    const profile = await this.getProfile(id);
    if (!profile) return false;

    const result = await db.delete(profiles).where(eq(profiles.id, id));
    
    return (result.rowCount ?? 0) > 0;
  }

  // Worker methods
  async getAllWorkers(): Promise<Worker[]> {
    return await db.select().from(workers);
  }

  async getWorker(id: number): Promise<Worker | undefined> {
    const [worker] = await db.select().from(workers).where(eq(workers.id, id));
    return worker || undefined;
  }

  async getWorkerByUsername(username: string): Promise<Worker | undefined> {
    const [worker] = await db.select().from(workers).where(eq(workers.username, username));
    return worker || undefined;
  }

  async createWorker(insertWorker: InsertWorker): Promise<Worker> {
    const now = new Date().toISOString();
    const [worker] = await db
      .insert(workers)
      .values({
        ...insertWorker,
        description: insertWorker.description || "",
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return worker;
  }

  async updateWorker(id: number, updateData: Partial<InsertWorker>): Promise<Worker | undefined> {
    const updatedData = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    const [worker] = await db
      .update(workers)
      .set(updatedData)
      .where(eq(workers.id, id))
      .returning();

    return worker || undefined;
  }

  async deleteWorker(id: number): Promise<boolean> {
    const result = await db.delete(workers).where(eq(workers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // File system methods (keep for script and profile files)
  async saveScriptFile(filename: string, content: string): Promise<void> {
    const scriptsDir = path.join(process.cwd(), 'scripts');
    await fs.mkdir(scriptsDir, { recursive: true });
    await fs.writeFile(path.join(scriptsDir, filename), content);
  }

  async getScriptFile(filename: string): Promise<string> {
    const scriptsDir = path.join(process.cwd(), 'scripts');
    return await fs.readFile(path.join(scriptsDir, filename), 'utf-8');
  }

  async deleteScriptFile(filename: string): Promise<void> {
    const scriptsDir = path.join(process.cwd(), 'scripts');
    try {
      await fs.unlink(path.join(scriptsDir, filename));
    } catch (error) {
      // File might not exist, ignore error
    }
  }

  async saveProfileFile(filename: string, content: string): Promise<void> {
    const profilesDir = path.join(process.cwd(), 'profiles');
    await fs.mkdir(profilesDir, { recursive: true });
    await fs.writeFile(path.join(profilesDir, filename), content);
  }

  async getProfileFile(filename: string): Promise<string> {
    const profilesDir = path.join(process.cwd(), 'profiles');
    return await fs.readFile(path.join(profilesDir, filename), 'utf-8');
  }

  async deleteProfileFile(filename: string): Promise<void> {
    const profilesDir = path.join(process.cwd(), 'profiles');
    try {
      await fs.unlink(path.join(profilesDir, filename));
    } catch (error) {
      // File might not exist, ignore error
    }
  }
}

export const storage = new DatabaseStorage();
