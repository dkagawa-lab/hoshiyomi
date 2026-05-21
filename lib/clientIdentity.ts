export const clientUserIdKey = "hoshiyomi:clientUserId";

export function ensureClientUserId() {
  if (typeof window === "undefined") return "";
  const saved = readClientStorage("localStorage") ?? readClientStorage("sessionStorage");
  if (saved) return saved;
  const nextId = typeof window.crypto?.randomUUID === "function" ? window.crypto.randomUUID() : `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  writeClientUserId(nextId);
  return nextId;
}

export function writeClientUserId(value: string) {
  if (typeof window === "undefined") return;
  writeClientStorage("localStorage", value);
  writeClientStorage("sessionStorage", value);
}

function readClientStorage(storageName: "localStorage" | "sessionStorage") {
  try {
    return window[storageName].getItem(clientUserIdKey);
  } catch {
    return null;
  }
}

function writeClientStorage(storageName: "localStorage" | "sessionStorage", value: string) {
  try {
    window[storageName].setItem(clientUserIdKey, value);
  } catch {}
}
