/**
 * Registers the door-mode service worker.
 *
 * Called only from the check-in screen: a worker installed on a page nobody
 * uses offline is a cache to invalidate for no benefit. Registration failing
 * is not an error worth surfacing. The door still works, it just will not
 * survive a reload without signal.
 */
export const registerDoorServiceWorker = async () => {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  /* Service workers need a secure context; localhost counts. */
  if (!window.isSecureContext) {
    return false;
  }

  try {
    await navigator.serviceWorker.register("/door-sw.js");
    return true;
  } catch {
    return false;
  }
};
