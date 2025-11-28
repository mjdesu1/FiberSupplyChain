# Done Monitor Status Migration

## Overview
This migration adds the "Done Monitor" status to the monitoring_records table and implements automatic status updates for old monitoring records.

## What It Does

### 1. Database Schema Changes
- Adds "Done Monitor" as a valid status option (alongside "Ongoing" and "Completed")
- Updates constraints to allow "Done Monitor" status

### 2. Automatic Status Updates
When a new monitoring record is created for a farmer:
- All previous "Ongoing" records for that farmer are automatically marked as "Done Monitor"
- This happens via a database trigger

### 3. Business Logic

#### Status Meanings:

**"Ongoing"** - Current/Active Monitoring
- Latest monitoring record for the farmer
- Has next_monitoring_date
- Shows countdown in UI (e.g., "in 26 days")

**"Done Monitor"** - Old Monitoring (Superseded)
- Previous monitoring records that have been replaced by newer ones
- **Still has next_monitoring_date** (but not relevant anymore)
- Shows "Done Monitor" badge in UI (no countdown)
- Automatically set by trigger when new monitoring is added

**"Completed"** - Final/Last Monitoring
- Last monitoring for the farm (e.g., harvest done, farm closed)
- **No next_monitoring_date** (NULL) - monitoring cycle ended
- Shows "✓ Completed" badge in UI
- Manually set by MAO officer

#### Example Flow:
**Current Month (November 2025)**
- Create monitoring record for Farmer A
- Status: "Ongoing"
- Next Visit: December 24, 2025
- UI: Shows "December 24, 2025 (in 26 days)"

**Next Month (December 2025)**
- Create new monitoring record for Farmer A
- Status: "Ongoing"
- Previous record (November) automatically becomes: Status = "Done Monitor"
- UI: November shows "Done Monitor" badge, December shows countdown

**Farm Harvest Completed**
- MAO marks December record as "Completed"
- Next Visit: NULL (no more monitoring needed)
- UI: Shows "✓ Completed" badge

#### UI Display:
- **Ongoing records**: Show next visit date with countdown (e.g., "in 26 days")
- **Done Monitor records**: Show "Done Monitor" badge (no countdown, even if next_monitoring_date exists)
- **Completed records**: Show "✓ Completed" badge (final monitoring)

## How to Run

### Option 1: Using psql
```bash
psql -U your_username -d your_database -f add_done_monitor_status.sql
```

### Option 2: Using Supabase Dashboard
1. Go to SQL Editor in Supabase Dashboard
2. Copy and paste the contents of `add_done_monitor_status.sql`
3. Click "Run"

### Option 3: Using Node.js/Backend
```javascript
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const sql = fs.readFileSync('./add_done_monitor_status.sql', 'utf8');
await pool.query(sql);
```

## Testing

### 1. Test Status Addition
```sql
-- Should work now (previously would fail)
UPDATE monitoring_records 
SET status = 'Done Monitor' 
WHERE monitoring_id = 'some-id';
```

### 2. Test Automatic Trigger
```sql
-- Insert a new record for an existing farmer
INSERT INTO monitoring_records (
  monitoring_id, 
  date_of_visit, 
  monitored_by, 
  farmer_id,
  farmer_name,
  farm_condition,
  growth_stage,
  actions_taken,
  recommendations,
  status
) VALUES (
  'MON-NEW-123',
  CURRENT_DATE,
  'Test Officer',
  'existing-farmer-uuid',
  'Test Farmer',
  'Healthy',
  'Vegetative',
  'Regular monitoring',
  'Continue current practices',
  'Ongoing'
);

-- Check that old records for this farmer are now "Done Monitor"
SELECT monitoring_id, date_of_visit, status 
FROM monitoring_records 
WHERE farmer_id = 'existing-farmer-uuid'
ORDER BY date_of_visit DESC;
```

## Rollback

If you need to rollback this migration:

```sql
-- Remove the trigger
DROP TRIGGER IF EXISTS auto_mark_old_monitoring_done ON public.monitoring_records;
DROP FUNCTION IF EXISTS mark_old_monitoring_as_done();

-- Revert status constraint to original
ALTER TABLE public.monitoring_records 
DROP CONSTRAINT IF EXISTS monitoring_records_status_check;

ALTER TABLE public.monitoring_records 
ADD CONSTRAINT monitoring_records_status_check 
CHECK (
  status::text = ANY (
    ARRAY[
      'Ongoing'::character varying,
      'Completed'::character varying
    ]::text[]
  )
);

-- Update all "Done Monitor" records back to "Ongoing"
UPDATE monitoring_records 
SET status = 'Ongoing' 
WHERE status = 'Done Monitor';
```

## Notes
- The trigger only affects records with status = 'Ongoing'
- Completed records are never changed to "Done Monitor"
- The trigger runs AFTER INSERT, so the new record is already saved
- Only records with earlier dates are marked as "Done Monitor"
