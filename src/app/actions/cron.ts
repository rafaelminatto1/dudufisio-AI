// src/app/actions/cron.ts
"use server";

import { performDatabaseBackup } from '~/lib/utils/backup';
import { processDailyReminders } from '~/lib/utils/reminders';

export async function triggerManualBackup() {
  console.log("[Server Action] Manual backup triggered.");
  const result = await performDatabaseBackup();
  if (!result.success) {
    console.error("[Server Action] Manual backup failed:", result.error);
  } else {
    console.log("[Server Action] Manual backup completed successfully:", result.backup_id);
  }
  return result;
}

export async function triggerManualRemindersProcessing() {
  console.log("[Server Action] Manual reminders processing triggered.");
  const result = await processDailyReminders();
  if (!result.success) {
    console.error("[Server Action] Manual reminders processing failed:", result.error);
  } else {
    console.log("[Server Action] Manual reminders processing completed successfully.");
  }
  return result;
}
