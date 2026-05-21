export const clientUserIdKey = "hoshiyomi:clientUserId";

export function ensureClientUserId() {
  if (typeof window === "undefined") return "";
  const saved = readClientStorage("localStorage") ?? readClientStorage("sessionStorage");
  if (saved) return saved;
  const nextId = typeof window.crypto?.randomUUID === "function" ? window.crypto.randomUUID() : `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  writeClientStorage("localStorage", nextId);
  writeClientStorage("sessionStorage", nextId);
  return nextId;
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
