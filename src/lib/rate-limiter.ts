type RateLimitRecord = {
  timestamps: number[];
};

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Basic sliding window in-memory rate limiter.
 * @param key Unique identifier (e.g. user ID, IP address, or action key)
 * @param limit Max number of requests allowed in the window duration
 * @param windowMs Time window in milliseconds (e.g. 60000 for 1 minute)
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key) || { timestamps: [] };

  // Filter out timestamps older than the sliding window limit
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetTime = oldest + windowMs;
    return {
      success: false,
      remaining: 0,
      reset: resetTime
    };
  }

  record.timestamps.push(now);
  rateLimitMap.set(key, record);

  return {
    success: true,
    remaining: limit - record.timestamps.length,
    reset: now + windowMs
  };
}
