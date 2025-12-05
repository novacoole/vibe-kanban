-- Add release_ports_on_completion column to projects table
-- When enabled, assigned ports are automatically released when a task is completed
-- Default is TRUE (enabled) for all projects
ALTER TABLE projects ADD COLUMN release_ports_on_completion BOOLEAN NOT NULL DEFAULT TRUE;
