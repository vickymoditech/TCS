import { salesforceClient } from './salesforceClient';
import { SALESFORCE_CART_TTL_MS } from '../config';

/**
 * Sweep a single time: list all Salesforce contexts and delete those older
 * than the configured TTL. Returns the list of deleted context ids.
 */
export function sweepOnce() {
  const now = Date.now();
  const all = salesforceClient.listAll();
  const expired = all.filter((c) => now - c.createdAt > SALESFORCE_CART_TTL_MS);
  expired.forEach((c) => salesforceClient.deleteCart(c.id));
  return expired.map((c) => c.id);
} 

let interval: ReturnType<typeof setInterval> | null = null;

/**
 * Start a periodic sweeper that deletes expired Salesforce contexts.
 * No-op if already running.
 */
export function startSweeper(intervalMs = 60 * 1000) {
  if (interval) return;
  interval = setInterval(sweepOnce, intervalMs);
}

/** Stop the sweeper when running (used by tests to avoid background activity). */
export function stopSweeper() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
} 
