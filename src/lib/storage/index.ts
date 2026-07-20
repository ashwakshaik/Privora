import { StorageAdapter } from "./StorageAdapter";
import { LocalStorageAdapter } from "./LocalStorageAdapter";
import { SupabaseAdapter } from "./SupabaseAdapter";
import { config } from "../env";

export * from "./types";
export * from "./StorageAdapter";

let activeAdapter: StorageAdapter | null = null;

export function createStorageAdapter(): StorageAdapter {
  if (activeAdapter) return activeAdapter;

  if (config.isSupabaseConfigured) {
    console.log("[Storage] Initializing Supabase Storage Adapter");
    activeAdapter = new SupabaseAdapter();
  } else {
    console.log("[Storage] Initializing LocalStorage Mock Storage Adapter");
    activeAdapter = new LocalStorageAdapter();
  }
  return activeAdapter;
}

export const storage = createStorageAdapter();
