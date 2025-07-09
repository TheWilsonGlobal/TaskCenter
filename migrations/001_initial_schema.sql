-- Initial schema setup

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'READY', 'RUNNING', 'COMPLETED', 'FAILED', 'REJECTED')),
  worker_id INTEGER NOT NULL,
  profile_id INTEGER,
  script_id INTEGER NOT NULL,
  respond TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  
  CONSTRAINT fk_worker
    FOREIGN KEY(worker_id) 
    REFERENCES workers(id),
  
  CONSTRAINT fk_profile
    FOREIGN KEY(profile_id) 
    REFERENCES profiles(id),
  
  CONSTRAINT fk_script
    FOREIGN KEY(script_id) 
    REFERENCES scripts(id)
);

-- Create scripts table
CREATE TABLE IF NOT EXISTS scripts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT DEFAULT '',
  size INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  user_agent TEXT DEFAULT 'chrome-linux',
  custom_user_agent TEXT DEFAULT '',
  viewport_width INTEGER DEFAULT 1920,
  viewport_height INTEGER DEFAULT 1080,
  timezone TEXT DEFAULT 'America/New_York',
  language TEXT DEFAULT 'en-US',
  use_proxy BOOLEAN DEFAULT false,
  proxy_type TEXT DEFAULT 'http',
  proxy_host TEXT DEFAULT '',
  proxy_port TEXT DEFAULT '',
  proxy_username TEXT DEFAULT '',
  proxy_password TEXT DEFAULT '',
  custom_field TEXT DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Create workers table
CREATE TABLE IF NOT EXISTS workers (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
