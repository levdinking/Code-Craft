import { useSyncExternalStore } from 'react';

const COOKIE_CONSENT_KEY = 'cookie-consent';

function getSnapshot(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(COOKIE_CONSENT_KEY);
}

function getServerSnapshot(): null {
  return null;
}

function subscribe(callback: () => void) {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === COOKIE_CONSENT_KEY) {
      callback();
    }
  };
  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}

export function useCookieConsent() {
  const stored = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const consent = stored === null ? null : stored === 'true';

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    window.dispatchEvent(new StorageEvent('storage', { key: COOKIE_CONSENT_KEY }));
  };

  const decline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'false');
    window.dispatchEvent(new StorageEvent('storage', { key: COOKIE_CONSENT_KEY }));
  };

  const reset = () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    window.dispatchEvent(new StorageEvent('storage', { key: COOKIE_CONSENT_KEY }));
  };

  return {
    consent,
    isLoaded: true,
    accept,
    decline,
    reset,
    showBanner: consent === null
  };
}