import { storage } from './storage';
import { MemStorage } from './storage';
import fs from 'fs/promises';
import path from 'path';

async function migrateData() {
  console.log('Starting data migration from files to PostgreSQL...');
  
  // Create temporary file storage to read existing data
  const fileStorage = new MemStorage();
  
  try {
    // Migrate existing scripts
    console.log('Migrating scripts...');
    const existingScripts = await fileStorage.getAllScripts();
    for (const script of existingScripts) {
      try {
        await storage.createScript({
          filename: script.filename,
          content: script.content,
          description: script.description || "",
        });
        console.log(`✓ Migrated script: ${script.filename}`);
      } catch (error) {
        console.log(`⚠ Script ${script.filename} already exists in database`);
      }
    }

    // Migrate existing profiles
    console.log('Migrating profiles...');
    const existingProfiles = await fileStorage.getAllProfiles();
    for (const profile of existingProfiles) {
      try {
        await storage.createProfile({
          profileId: profile.profileId,
          name: profile.name,
          description: profile.description || "",
          filename: profile.filename,
          content: profile.content,
          userAgent: profile.userAgent,
          customUserAgent: profile.customUserAgent,
          viewportWidth: profile.viewportWidth,
          viewportHeight: profile.viewportHeight,
          timezone: profile.timezone,
          language: profile.language,
          useProxy: profile.useProxy,
          proxyType: profile.proxyType,
          proxyHost: profile.proxyHost,
          proxyPort: profile.proxyPort,
          proxyUsername: profile.proxyUsername,
          proxyPassword: profile.proxyPassword,
          scriptSource: profile.scriptSource,
          customScript: profile.customScript,
          customField: profile.customField || "{}",
        });
        console.log(`✓ Migrated profile: ${profile.filename}`);
      } catch (error) {
        console.log(`⚠ Profile ${profile.filename} already exists in database`);
      }
    }

    // Migrate existing tasks
    console.log('Migrating tasks...');
    const existingTasks = await fileStorage.getAllTasks();
    for (const task of existingTasks) {
      try {
        await storage.createTask({
          status: task.status,
          workerId: task.workerId,
          profile: task.profile,
          script: task.script,
          respond: task.respond || "",
        });
        console.log(`✓ Migrated task: ${task.id}`);
      } catch (error) {
        console.log(`⚠ Task ${task.id} migration failed:`, error);
      }
    }

    console.log('✅ Data migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateData().then(() => process.exit(0)).catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

export { migrateData };