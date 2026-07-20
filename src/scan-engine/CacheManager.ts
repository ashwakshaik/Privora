import { ScanResult } from "@/types/scan";
import { logger } from "@/lib/logger";

interface CacheEntry {
  result: ScanResult[];
  timestamp: number;
}

export class CacheManager {
  private static cache = new Map<string, CacheEntry>();
  // 4 Hours TTL in milliseconds (4 * 60 * 60 * 1000)
  private static CACHE_TTL_MS = 14400000;

  static get(key: string): ScanResult[] | null {
    const entry = this.cache.get(key.toLowerCase().trim());
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > this.CACHE_TTL_MS) {
      logger.info(`[Cache] Cache expired for key: ${key}`);
      this.cache.delete(key.toLowerCase().trim());
      return null;
    }

    logger.info(`[Cache] Cache hit for key: ${key}`);
    return entry.result;
  }

  static set(key: string, result: ScanResult[]): void {
    logger.info(`[Cache] Storing results for key: ${key}`);
    this.cache.set(key.toLowerCase().trim(), {
      result,
      timestamp: Date.now(),
    });
  }

  static clear(): void {
    logger.info("[Cache] Clearing all stored search history entries.");
    this.cache.clear();
  }
}
export const cacheManager = CacheManager;
