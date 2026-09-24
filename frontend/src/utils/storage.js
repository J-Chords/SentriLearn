// =============================================
// LOCAL STORAGE HELPERS — NAMESPACED DEMO PERSISTENCE
// =============================================

const PREFIX = 'sentrilearn:';

export const STORAGE_KEYS = {
  AUTH: 'auth',
  THEME: 'theme',
  MODULE_PROGRESS: 'module-progress',
  ASSESSMENT_RESULTS: 'assessment-results',
  REPORTS: 'reports',
  CAMPAIGNS: 'campaigns',
  ACTIVITY: 'activity',
  SIMULATION_STATS: 'simulation-stats',
};

export function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // storage unavailable — fail silently, demo state simply won't persist
  }
}

export function removeStorage(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}

/**
 * Ensures a key has a value in storage, seeding it with `defaults` on first load.
 */
export function ensureSeeded(key, defaults) {
  const existing = readStorage(key, undefined);
  if (existing === undefined) {
    writeStorage(key, defaults);
    return defaults;
  }
  return existing;
}
