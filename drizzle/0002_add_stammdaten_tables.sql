-- Migration: Add Activities and Cost Centers tables
-- PROJ-3: Admin Stammdaten-Verwaltung Backend
-- Date: 2026-02-12

-- Create Activities Table
CREATE TABLE "activities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create Cost Centers Table
CREATE TABLE "cost_centers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "number" text,
  "description" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX "idx_activities_name" ON "activities"("name");
CREATE INDEX "idx_cost_centers_name" ON "cost_centers"("name");
CREATE INDEX "idx_cost_centers_number" ON "cost_centers"("number");

-- Auto-update triggers for updated_at (reuse existing function from 0001 migration)
CREATE TRIGGER "update_activities_updated_at"
  BEFORE UPDATE ON "activities"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER "update_cost_centers_updated_at"
  BEFORE UPDATE ON "cost_centers"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
