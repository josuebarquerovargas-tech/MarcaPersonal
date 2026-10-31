export const LOGIN_MAX_FAILURES = 5;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export type RateLimitDeps = {
  findFailures(ip: string, since: Date): Promise<number>;
  record(ip: string, success: boolean): Promise<void>;
};

export type LoginAllowed = { allowed: boolean; retryAfterSec?: number };

export function createRateLimiter(deps: RateLimitDeps) {
  return {
    async checkLoginAllowed(ip: string, now: Date = new Date()): Promise<LoginAllowed> {
      const since = new Date(now.getTime() - LOGIN_WINDOW_MS);
      const failures = await deps.findFailures(ip, since);
      if (failures >= LOGIN_MAX_FAILURES) {
        return { allowed: false, retryAfterSec: Math.ceil(LOGIN_WINDOW_MS / 1000) };
      }
      return { allowed: true };
    },
    async recordLoginAttempt(ip: string, success: boolean): Promise<void> {
      await deps.record(ip, success);
    },
  };
}
