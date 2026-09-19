---
name: Supabase connector schema changes
description: Limitation of the Supabase connector when a task needs DDL or migrations.
---

The Supabase connector exposes the project data API but cannot execute arbitrary SQL or apply schema migrations.

**Why:** PostgREST can read and write existing tables, but missing tables cannot be created through it and return `PGRST205`.

**How to apply:** Commit idempotent SQL migrations and clearly require applying them through the Supabase SQL Editor or a database connection before validating data flows.