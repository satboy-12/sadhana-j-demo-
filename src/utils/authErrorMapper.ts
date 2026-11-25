export function mapFirebaseAuthError(err: unknown, fallback: string): string {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code: unknown }).code)
      : typeof err === 'string'
      ? err
      : '';

  if (
    code.includes('auth/invalid-credential') ||
    code.includes('auth/user-not-found') ||
    code.includes('auth/wrong-password')
  ) {
    return 'Invalid email address or password. Please check your credentials and try again.';
  }
  if (code.includes('auth/email-already-in-use')) {
    return 'An account with this email address already exists. Please sign in instead.';
  }
  if (code.includes('auth/weak-password')) {
    return 'Password is too weak. Use at least 8 characters with letters, numbers, and symbols.';
  }
  if (code.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (code.includes('auth/too-many-requests')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (code.includes('auth/popup-closed-by-user')) {
    return 'Google sign-in was closed before completing authentication. Please try again.';
  }
  if (code.includes('auth/popup-blocked')) {
    return 'Your browser blocked the Google sign-in popup. Please allow popups for this site and try again.';
  }
  if (code.includes('auth/cancelled-popup-request')) {
    return 'Sign-in request was superseded. Please try again.';
  }
  if (code.includes('auth/account-exists-with-different-credential')) {
    return 'An account already exists with the same email using a different sign-in method.';
  }
  if (code.includes('auth/unauthorized-domain')) {
    return 'This domain is not yet authorized in Firebase Console (Authentication → Settings → Authorized domains).';
  }
  if (code.includes('auth/operation-not-allowed')) {
    return 'This sign-in method is not yet enabled in Firebase Console (Authentication → Sign-in method).';
  }
  if (code.includes('auth/requires-recent-login')) {
    return 'For security, please sign out and sign back in before completing this action.';
  }
  if (code.includes('auth/network-request-failed')) {
    return 'Network error while reaching Firebase Authentication. Check your connection and retry.';
  }

  return err instanceof Error && err.message ? err.message : fallback;
}
