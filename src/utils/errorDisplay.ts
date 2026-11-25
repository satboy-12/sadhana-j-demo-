import { ApiError } from '../api/client';

export function formatClientError(err: unknown, fallback: string): ApiError | string {
  if (err instanceof ApiError) return err;
  if (err instanceof Error && err.message) {
    try {
      const parsed = JSON.parse(err.message) as {
        error?: string;
        operationType?: string;
        path?: string;
      };
      if (parsed && parsed.error) {
        return `Cloud Firestore ${parsed.operationType || 'operation'} denied${
          parsed.path ? ` on ${parsed.path}` : ''
        }: ${parsed.error}`;
      }
    } catch {
      // plain error message
    }
    return err.message;
  }
  return fallback;
}
