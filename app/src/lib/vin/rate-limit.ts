/**
 * A fixed-window rate limiter, per key, held in the process.
 *
 * vPIC publishes no quota, and the squish-VIN cache already keeps us far from
 * any plausible one. This exists for the other direction: an authenticated
 * account looping over the endpoint should not be able to turn our server into
 * a proxy for someone else's scraping.
 */

/** One caller's activity inside the current window. */
interface Window {
  count: number
  startedAt: number
}

/**
 * Build a limiter.
 *
 * The clock is passed in on every call rather than read from `Date.now()`
 * inside, so the windowing is testable without waiting for real time to pass.
 *
 * @param props - Limiter settings.
 * @param props.max - How many calls a key may make per window.
 * @param props.windowMs - Length of the window, in milliseconds.
 */
export function createRateLimiter(props: {
  max: number
  windowMs: number
}): { allow: (key: string, now: number) => boolean } {
  const { max, windowMs } = props
  const windows = new Map<string, Window>()

  return {
    /**
     * Record a call and report whether it is allowed.
     *
     * @param key - Who is calling, usually a user id.
     * @param now - The current time, in milliseconds.
     */
    allow: (key: string, now: number): boolean => {
      const current = windows.get(key)

      if (current === undefined || now - current.startedAt >= windowMs) {
        windows.set(key, { count: 1, startedAt: now })
        return true
      }

      if (current.count >= max) return false

      current.count += 1
      return true
    },
  }
}
