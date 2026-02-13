-- Migration: Add Time Entries table
-- PROJ-4: Zeiterfassung Backend
-- Date: 2026-02-13

-- Create Time Entries Table
CREATE TABLE "time_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"activity_id" uuid NOT NULL,
	"cost_center_id" uuid NOT NULL,
	"hours" real NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hours_range" CHECK (hours >= 0.25 AND hours <= 24)
);
--> statement-breakpoint

-- Foreign Keys
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_cost_center_id_cost_centers_id_fk" FOREIGN KEY ("cost_center_id") REFERENCES "public"."cost_centers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint

-- Indexes for performance (user_id + date for month queries)
CREATE INDEX "idx_time_entries_user_date" ON "time_entries"("user_id", "date" DESC);--> statement-breakpoint
CREATE INDEX "idx_time_entries_activity" ON "time_entries"("activity_id");--> statement-breakpoint
CREATE INDEX "idx_time_entries_cost_center" ON "time_entries"("cost_center_id");--> statement-breakpoint

-- Auto-update trigger for updated_at (reuse existing function)
CREATE TRIGGER "update_time_entries_updated_at"
  BEFORE UPDATE ON "time_entries"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();