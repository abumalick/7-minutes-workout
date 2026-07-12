import { browser } from "$app/environment";

// Keeps the screen awake while a workout runs. The browser auto-releases the
// lock when the tab is hidden, so callers re-request it on `visibilitychange`.
let sentinel: WakeLockSentinel | null = null;

export async function requestWakeLock(): Promise<void> {
  if (!browser || !("wakeLock" in navigator)) return;
  try {
    sentinel = await navigator.wakeLock.request("screen");
  } catch {
    // Denied, or the tab was hidden mid-request — safe to ignore.
  }
}

export function releaseWakeLock(): void {
  sentinel?.release().catch(() => {});
  sentinel = null;
}
