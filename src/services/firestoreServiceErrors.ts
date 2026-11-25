import type { User as FirebaseUser } from 'firebase/auth';
import { ApiError } from '../api/client';
import { auth } from '../firebase/firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

const IS_DEV = Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV);

export function requireAuthenticatedUser(endpoint: string, method: string): FirebaseUser {
  const user = auth.currentUser;
  if (!user) {
    throw new ApiError({
      message: 'Please sign in to access your private health records.',
      code: 'UNAUTHORIZED',
      status: 401,
      endpoint,
      method,
    });
  }
  return user;
}

export function isPermissionDeniedError(err: unknown): boolean {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code: unknown }).code).toLowerCase()
      : '';
  const msg = err instanceof Error ? err.message.toLowerCase() : String(err || '').toLowerCase();
  return (
    code.includes('permission-denied') ||
    code.includes('permission_denied') ||
    msg.includes('missing or insufficient permissions') ||
    msg.includes('permission denied')
  );
}

export function isNetworkOrUnavailableError(err: unknown): boolean {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code: unknown }).code).toLowerCase()
      : '';
  const msg = err instanceof Error ? err.message.toLowerCase() : String(err || '').toLowerCase();
  return (
    code.includes('unavailable') ||
    code.includes('network') ||
    msg.includes('client is offline') ||
    msg.includes('network') ||
    msg.includes('offline')
  );
}

export function wrapFirestoreError(
  err: unknown,
  operationType: OperationType,
  path: string,
  endpoint: string,
  method: string,
  fallback: string,
): never {
  if (err instanceof ApiError) {
    throw err;
  }

  if (isPermissionDeniedError(err)) {
    handleFirestoreError(err, operationType, path);
  }

  const rawCode =
    err && typeof err === 'object' && 'code' in err ? String((err as { code: unknown }).code) : '';
  const rawMessage = err instanceof Error && err.message ? err.message : fallback;

  if (IS_DEV) {
    console.error('[Cloud Firestore Error]', {
      endpoint,
      method,
      path,
      uid: auth.currentUser?.uid || null,
      code: rawCode || undefined,
      message: rawMessage,
    });
  }

  if (isNetworkOrUnavailableError(err)) {
    throw new ApiError({
      message: 'Unable to reach Cloud Firestore right now. Check your connection and try again.',
      code: 'BACKEND_UNAVAILABLE',
      status: 503,
      endpoint,
      method,
    });
  }

  throw new ApiError({
    message: rawMessage,
    code: 'SERVER_ERROR',
    status: 500,
    endpoint,
    method,
  });
}
