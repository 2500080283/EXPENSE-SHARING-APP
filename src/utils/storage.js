import {
  INITIAL_USERS,
  INITIAL_GROUPS,
  INITIAL_EXPENSES,
  INITIAL_SETTLEMENTS,
  INITIAL_REMINDERS,
  INITIAL_DISPUTES,
  INITIAL_CATEGORIES,
  INITIAL_PLATFORM_SETTINGS
} from "../data/initialData";

const STORAGE_KEY = "sharewise_app_state_v1";

export function getInitialState() {
  return {
    users: INITIAL_USERS,
    groups: INITIAL_GROUPS,
    expenses: INITIAL_EXPENSES,
    settlements: INITIAL_SETTLEMENTS,
    reminders: INITIAL_REMINDERS,
    disputes: INITIAL_DISPUTES,
    categories: INITIAL_CATEGORIES,
    settings: INITIAL_PLATFORM_SETTINGS,
    activeUserId: "usr_1", // Default to Alex Rivera
    activeRole: "user", // "user" or "admin"
    theme: "dark" // default modern dark mode
  };
}

export function loadAppState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialState();
      saveAppState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    // Merge defensively with defaults in case of missing keys
    const fallback = getInitialState();
    return {
      users: parsed.users || fallback.users,
      groups: parsed.groups || fallback.groups,
      expenses: parsed.expenses || fallback.expenses,
      settlements: parsed.settlements || fallback.settlements,
      reminders: parsed.reminders || fallback.reminders,
      disputes: parsed.disputes || fallback.disputes,
      categories: parsed.categories || fallback.categories,
      settings: { ...fallback.settings, ...(parsed.settings || {}) },
      activeUserId: parsed.activeUserId || fallback.activeUserId,
      activeRole: parsed.activeRole || fallback.activeRole,
      theme: parsed.theme || "dark"
    };
  } catch (err) {
    console.error("Error reading localStorage, reverting to initial state:", err);
    const initial = getInitialState();
    saveAppState(initial);
    return initial;
  }
}

export function saveAppState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save state to localStorage:", err);
  }
}

export function resetAppToDefaults() {
  const initial = getInitialState();
  saveAppState(initial);
  return initial;
}

export function exportAppStateJSON(state) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `sharewise_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function calculateStorageSize() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || "";
    const bytes = new Blob([raw]).size;
    return (bytes / 1024).toFixed(1) + " KB";
  } catch {
    return "N/A";
  }
}
