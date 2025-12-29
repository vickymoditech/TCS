/**
 * Small logging wrapper used by the app so we have a single place to replace
 * or enhance logging behavior (e.g., add structured logs or external sinks).
 */
/* eslint-disable no-unused-vars */
export interface Logger {
  info: (...items: unknown[]) => void;
  warn: (...items: unknown[]) => void;
  error: (...items: unknown[]) => void;
}

export const log: Logger = {
  info: (...items: unknown[]) => console.log('[info]', ...items),
  warn: (...items: unknown[]) => console.warn('[warn]', ...items),
  error: (...items: unknown[]) => console.error('[error]', ...items),
};
/* eslint-enable no-unused-vars */
