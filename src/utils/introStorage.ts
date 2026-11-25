export const INTRO_SEEN_KEY = 'hhj_intro_seen';

export interface StorageReader {
  getItem(key: string): string | null;
}

export interface StorageWriter extends StorageReader {
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

let introCompletedInPageLoad = false;

export function hasCompletedIntro(storage?: StorageReader | null): boolean {
  if (introCompletedInPageLoad) return true;
  if (!storage) return false;
  try {
    return storage.getItem(INTRO_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

export function markIntroCompleted(storage?: StorageWriter | null): void {
  introCompletedInPageLoad = true;
  if (!storage) return;
  try {
    storage.setItem(INTRO_SEEN_KEY, '1');
  } catch {
    // Ignore storage access errors in restricted frames
  }
}

export function clearIntroCompleted(storage?: StorageWriter | null): void {
  introCompletedInPageLoad = false;
  if (!storage) return;
  try {
    storage.removeItem(INTRO_SEEN_KEY);
  } catch {
    // Ignore storage access errors
  }
}

/**
 * Plays on every fresh website load (in-memory page-load tracker starts false on reload),
 * unless ?autostart=1 is explicitly supplied or intro already finished during this SPA session.
 */
export function shouldShowCinematicIntro(options: {
  autostartBypass?: boolean;
  replayRequested?: boolean;
}): boolean {
  if (options.autostartBypass) return false;
  if (options.replayRequested) return true;
  return !introCompletedInPageLoad;
}
