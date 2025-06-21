import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Statuses of Task:                                      
// NEW <=> READY                  by  Task Center
//           |                             
//     --> RUNNING                by  Worker
//    |   /      \
//   FAIL          COMPLETE       by  Worker
//                    ||
//                 REJECTED       by  Task Center (optional)

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  status: text("status", { enum: ["NEW", "READY", "RUNNING", "COMPLETED", "FAILED", "REJECTED"] }).notNull().default("NEW"),
  workerId: integer("worker_id").notNull().references(() => workers.id),
  profileId: integer("profile_id").notNull().references(() => profiles.id),
  scriptId: integer("script_id").notNull().references(() => scripts.id),
  respond: text("respond").default(""),
  createdAt: text("created_at").notNull(),
});

export const scripts = pgTable("scripts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  description: text("description").default(""),
  size: integer("size").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default(""),
  userAgent: text("user_agent").default("chrome-linux"),
  customUserAgent: text("custom_user_agent").default(""),
  viewportWidth: integer("viewport_width").default(1920),
  viewportHeight: integer("viewport_height").default(1080),
  timezone: text("timezone").default("America/New_York"),
  language: text("language").default("en-US"),
  useProxy: boolean("use_proxy").default(false),
  proxyType: text("proxy_type").default("http"),
  proxyHost: text("proxy_host").default(""),
  proxyPort: text("proxy_port").default(""),
  proxyUsername: text("proxy_username").default(""),
  proxyPassword: text("proxy_password").default(""),

  customField: text("custom_field").default("{}"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const workers = pgTable("workers", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  description: text("description").default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Relations
export const tasksRelations = relations(tasks, ({ one }) => ({
  profile: one(profiles, {
    fields: [tasks.profileId],
    references: [profiles.id],
  }),
  script: one(scripts, {
    fields: [tasks.scriptId],
    references: [scripts.id],
  }),
  worker: one(workers, {
    fields: [tasks.workerId],
    references: [workers.id],
  }),
}));

export const profilesRelations = relations(profiles, ({ many }) => ({
  tasks: many(tasks),
}));

export const scriptsRelations = relations(scripts, ({ many }) => ({
  tasks: many(tasks),
}));

export const workersRelations = relations(workers, ({ many }) => ({
  tasks: many(tasks),
}));

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertScriptSchema = createInsertSchema(scripts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  size: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkerSchema = createInsertSchema(workers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect & {
  profile?: Profile;
  script?: Script;
  worker?: Worker;
};

export type InsertScript = z.infer<typeof insertScriptSchema>;
export type Script = typeof scripts.$inferSelect;

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export type InsertWorker = z.infer<typeof insertWorkerSchema>;
export type Worker = typeof workers.$inferSelect;

export type User = {
  id: number;
  username: string;
  password: string;
};

export type InsertUser = {
  username: string;
  password: string;
};
