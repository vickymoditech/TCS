import { salesforceClient } from './salesforceClient';
import { SALESFORCE_CART_TTL_MS } from '../config';

export function sweepOnce() {
  const now = Date.now();
  const all = salesforceClient.listAll();
  const expired = all.filter((c) => now - c.createdAt > SALESFORCE_CART_TTL_MS);
  expired.forEach((c) => salesforceClient.deleteCart(c.id));
  return expired.map((c) => c.id);
}

let interval: NodeJS.Timeout | null = null;

export function startSweeper(intervalMs = 60 * 1000) {
  if (interval) return;
  interval = setInterval(sweepOnce, intervalMs);
}

export function stopSweeper() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}
