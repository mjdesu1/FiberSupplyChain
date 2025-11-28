# Done Monitor - Complete Deployment Steps

## 🎯 Goal
Automatically mark old monitoring records as "Done Monitor" when a new monitoring is created for the same farmer.

---

## 📋 Step-by-Step Deployment

### **Step 1: Run Main Migration**
This adds the "Done Monitor" status and creates the automatic trigger.

```bash
# Using psql
psql -U your_username -d your_database -f add_done_monitor_status.sql

# OR using Supabase Dashboard
# 1. Go to SQL Editor
# 2. Copy contents of add_done_monitor_status.sql
# 3. Click "Run"
```

**What this does:**
- ✅ Adds "Done Monitor" as valid status
- ✅ Creates trigger function `mark_old_monitoring_as_done()`
- ✅ Creates trigger `auto_mark_old_monitoring_done`
- ✅ Updates constraints

---

### **Step 2: Update Existing Records**
This fixes old data that's currently still "Ongoing".

```bash
# Using psql
psql -U your_username -d your_database -f update_existing_records_to_done_monitor.sql

# OR using Supabase Dashboard
# 1. Go to SQL Editor
# 2. Copy contents of update_existing_records_to_done_monitor.sql
# 3. Click "Run"
```

**What this does:**
- ✅ For each farmer, keeps only the latest record as "Ongoing"
- ✅ Marks all older records as "Done Monitor"
- ✅ Works per farmer basis

**Example:**
```
Before:
- Farmer "reyn": Nov 18 (Ongoing), Nov 5 (Ongoing) ❌
- Farmer "test": Nov 27 (Ongoing), Nov 7 (Ongoing) ❌

After:
- Farmer "reyn": Nov 18 (Ongoing), Nov 5 (Done Monitor) ✅
- Farmer "test": Nov 27 (Ongoing), Nov 7 (Done Monitor) ✅
```

---

### **Step 3: Verify**
Run the test script to verify everything works.

```bash
# Using psql
psql -U your_username -d your_database -f TEST_DONE_MONITOR.sql

# OR using Supabase Dashboard
# 1. Go to SQL Editor
# 2. Copy contents of TEST_DONE_MONITOR.sql
# 3. Click "Run"
```

**Check:**
- [ ] Each farmer has only 1 "Ongoing" record (the latest)
- [ ] Old records are "Done Monitor"
- [ ] Trigger function exists
- [ ] Trigger is active

---

### **Step 4: Test the Trigger**
Create a new monitoring record and verify old ones auto-update.

```sql
-- Example: Add new monitoring for farmer "reyn"
INSERT INTO public.monitoring_records (
  monitoring_id,
  date_of_visit,
  monitored_by,
  farmer_name,
  farm_condition,
  growth_stage,
  actions_taken,
  recommendations,
  next_monitoring_date,
  status
) VALUES (
  'MON-' || EXTRACT(EPOCH FROM NOW())::bigint || '-999',
  CURRENT_DATE,
  'Test Officer',
  'reyn',
  'Healthy',
  'Vegetative',
  'Regular monitoring',
  'Continue practices',
  CURRENT_DATE + INTERVAL '30 days',
  'Ongoing'
);

-- Check: Old "Ongoing" record for "reyn" should now be "Done Monitor"
SELECT farmer_name, date_of_visit, status 
FROM public.monitoring_records 
WHERE farmer_name = 'reyn' 
ORDER BY date_of_visit DESC;
```

**Expected Result:**
```
farmer_name | date_of_visit | status
------------|---------------|-------------
reyn        | 2025-11-28    | Ongoing       ← NEW (latest)
reyn        | 2025-11-18    | Done Monitor  ← AUTO-UPDATED
reyn        | 2025-11-05    | Done Monitor  ← Already done
```

---

### **Step 5: Refresh Frontend**
The frontend is already updated. Just refresh the page.

**What you'll see:**

**Status Column:**
- ✓ Done Monitor (gray badge)
- 🔄 Ongoing (blue badge)
- ✓ Completed (green badge)

**Next Visit Column:**
- "Done Monitor" badge for old records
- Date + countdown for Ongoing records
- "No next visit" for Completed records

---

## 🔍 Troubleshooting

### Issue: Old records still showing as "Ongoing"
**Solution:** Run Step 2 again (update_existing_records_to_done_monitor.sql)

### Issue: Trigger not working
**Check:**
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'auto_mark_old_monitoring_done';

-- Check if function exists
SELECT * FROM pg_proc WHERE proname = 'mark_old_monitoring_as_done';
```

**Fix:** Re-run Step 1 (add_done_monitor_status.sql)

### Issue: Multiple "Ongoing" records per farmer
**Solution:**
```sql
-- Manually fix
WITH latest_records_per_farmer AS (
  SELECT DISTINCT ON (farmer_name)
    monitoring_id
  FROM public.monitoring_records
  WHERE status = 'Ongoing'
  ORDER BY farmer_name, date_of_visit DESC
)
UPDATE public.monitoring_records
SET status = 'Done Monitor', updated_at = NOW()
WHERE status = 'Ongoing'
  AND monitoring_id NOT IN (SELECT monitoring_id FROM latest_records_per_farmer);
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Step 1 completed: Trigger created
- [ ] Step 2 completed: Old records updated
- [ ] Each farmer has only 1 "Ongoing" record
- [ ] Old records show "Done Monitor" status
- [ ] Frontend shows correct badges
- [ ] New monitoring auto-updates old records
- [ ] No errors in database logs

---

## 📊 How It Works (Per Farmer)

```
┌─────────────────────────────────────────────────────────┐
│ Farmer: "reyn"                                          │
├─────────────────────────────────────────────────────────┤
│ Nov 5:  Status = Done Monitor  (old)                    │
│ Nov 18: Status = Ongoing       (latest) ← Only 1        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Farmer: "test"                                          │
├─────────────────────────────────────────────────────────┤
│ Nov 7:  Status = Done Monitor  (old)                    │
│ Nov 27: Status = Ongoing       (latest) ← Only 1        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Farmer: "cusafa"                                        │
├─────────────────────────────────────────────────────────┤
│ Nov 7:  Status = Done Monitor  (old)                    │
│ Nov 27: Status = Ongoing       (latest) ← Only 1        │
└─────────────────────────────────────────────────────────┘
```

**When you add new monitoring for "reyn" on Nov 28:**
1. Insert new record → Status = "Ongoing"
2. Trigger fires automatically
3. Nov 18 record → Status changes to "Done Monitor"
4. Nov 28 record → Stays "Ongoing" (latest)

---

## 🎉 Done!

After completing all steps:
- ✅ Automatic "Done Monitor" is working
- ✅ Per farmer basis
- ✅ Frontend displays correctly
- ✅ No manual updates needed in the future
