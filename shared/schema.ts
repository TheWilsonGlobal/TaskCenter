import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  status: text("status", { enum: ["READY", "RUNNING", "COMPLETED", "FAILED"] }).notNull().default("READY"),
  workerId: text("worker_id").notNull(),
  profile: text("profile").notNull(),
  script: text("script").notNull(),
  respond: text("respond").default(""),
  createdAt: text("created_at").notNull(),
});

export const scripts = pgTable("scripts", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull().unique(),
  content: text("content").notNull(),
  description: text("description").default(""),
  size: integer("size").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull().unique(),
  content: text("content").notNull(),
  browser: text("browser").default("Chrome"),
  width: integer("width").default(1920),
  height: integer("height").default(1080),
  headless: boolean("headless").default(true),
  devtools: boolean("devtools").default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

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

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertScript = z.infer<typeof insertScriptSchema>;
export type Script = typeof scripts.$inferSelect;

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export type User = {
  id: number;
  username: string;
  password: string;
};

export type InsertUser = {
  username: string;
  password: string;
};
