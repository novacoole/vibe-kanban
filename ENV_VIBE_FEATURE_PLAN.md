# `.env.vibe` Template Processing Feature

## Status: ✅ IMPLEMENTED

## Overview

When vibe-kanban creates a worktree for a task attempt, if a `.env.vibe` file exists in the project root, it will:
1. Copy the file to the worktree as `.env`
2. Process template placeholders: `{{ auto_port() }}` and `{{ branch() }}`
3. Track assigned ports in the database to avoid conflicts across concurrent worktrees
4. Allow viewing and releasing ports via the Actions dropdown menu

## Template Syntax

Based on [sprout](../sprout)'s template syntax:

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{ auto_port() }}` | Assigns an available port (1024-65535) | `WEB_PORT={{ auto_port() }}` → `WEB_PORT=34521` |
| `{{ auto_port() \| 8080 }}` | Same as above (default captured but not used) | `PORT={{ auto_port() \| 3000 }}` → `PORT=34521` |
| `{{ branch() }}` | Substitutes the task attempt's branch name | `BRANCH={{ branch() }}` → `BRANCH=vk/fix-login-bug` |
| `{{ branch() \| main }}` | Uses default if branch is empty | `ENV={{ branch() \| dev }}` → `ENV=vk/fix-login-bug` |

## Port Allocation Logic

1. Query all ports currently used by active vibe-kanban worktrees from database
2. Generate random port between 1024-65535
3. Check port is not in the used ports set
4. Check port can be bound via socket test (ensures system availability)
5. Track ports assigned within the current file to avoid duplicates
6. Retry up to 1000 times if no port found

## Files Changed

### Backend

| File | Description |
|------|-------------|
| `crates/db/migrations/20251205161349_add_assigned_ports_to_task_attempts.sql` | Migration to add `assigned_ports TEXT` column |
| `crates/db/src/models/task_attempt.rs` | Added `assigned_ports` field, `update_assigned_ports()`, `release_assigned_ports()`, `get_all_active_ports()` methods |
| `crates/local-deployment/src/env_vibe.rs` | **New** - Template processing with 15 unit tests |
| `crates/local-deployment/src/lib.rs` | Added `mod env_vibe;` |
| `crates/local-deployment/src/container.rs` | Integrated env_vibe processing in `create()` method |
| `crates/local-deployment/Cargo.toml` | Added `rand` and `regex` dependencies |
| `crates/server/src/routes/task_attempts.rs` | Added `/release-ports` endpoint |

### Frontend

| File | Description |
|------|-------------|
| `frontend/src/lib/api.ts` | Added `releasePorts()` method to `attemptsApi` |
| `frontend/src/components/dialogs/tasks/AssignedPortsDialog.tsx` | **New** - Modal to view/release ports |
| `frontend/src/components/tasks/TaskDetails/AssignedPortsCard.tsx` | **New** - Collapsible card in processes view |
| `frontend/src/components/tasks/TaskDetails/ProcessesTab.tsx` | Added AssignedPortsCard before process list |
| `frontend/src/components/ui/actions-dropdown.tsx` | Added "View assigned ports" menu item |
| `frontend/src/components/dialogs/index.ts` | Export `AssignedPortsDialog` |
| `frontend/src/i18n/locales/en/tasks.json` | Added translations for assigned ports |
| `shared/types.ts` | Auto-generated - includes `assigned_ports` field |

## Usage

### Creating a `.env.vibe` file

Create `.env.vibe` in your project root:

```bash
# Database configuration
DB_HOST=localhost
DB_PORT={{ auto_port() }}
DB_NAME=myapp_{{ branch() | dev }}

# API configuration
API_PORT={{ auto_port() | 8080 }}

# Feature flags
DEBUG=true
```

**Important**: Add `.env.vibe` and `.env` to your `.gitignore`

### Viewing Assigned Ports

1. Open a task attempt
2. Click the Actions menu (three dots)
3. Select "View assigned ports"
4. A modal will show all assigned ports

### Releasing Ports

When a task is completed or discarded, you may want to release the ports for reuse:

1. Open the "View assigned ports" modal
2. Click "Release Ports" button
3. Ports are immediately freed for other worktrees

Ports are also automatically released when a worktree is marked as deleted.

## API

### Release Ports

```
POST /api/task-attempts/{attemptId}/release-ports
```

Clears the `assigned_ports` field, freeing ports for reuse.

## Database Schema

```sql
ALTER TABLE task_attempts ADD COLUMN assigned_ports TEXT;
```

The `assigned_ports` column stores a JSON object:
```json
{"WEB_PORT": 34521, "API_PORT": 34522, "DB_PORT": 34523}
```

## Tests

15 unit tests in `crates/local-deployment/src/env_vibe.rs`:
- `test_auto_port_replacement`
- `test_auto_port_with_default`
- `test_multiple_auto_ports`
- `test_auto_port_avoids_used_ports`
- `test_branch_replacement`
- `test_branch_with_default_uses_branch`
- `test_branch_with_default_uses_default`
- `test_branch_without_default_keeps_placeholder_when_empty`
- `test_mixed_placeholders`
- `test_no_placeholders`
- `test_whitespace_variants`
- `test_port_availability_check`
- `test_preserves_comments_and_empty_lines`
- `test_complex_env_file`
- `test_multiple_ports_on_same_line`
