/**
 * Navigation helper usable outside the React tree (e.g. axios interceptors).
 * Set the navigate function from a component inside RouterProvider.
 */

type NavigateFn = (to: string) => void;

let navigateRef: NavigateFn | null = null;

export function setAuthNavigate(fn: NavigateFn | null): void {
  navigateRef = fn;
}

/**
 * Navigate to a path via React Router when available.
 * Falls back to a full page load only if the router has not been wired yet.
 */
export function authNavigate(to: string): void {
  if (navigateRef) {
    navigateRef(to);
    return;
  }
  // Last resort: router not mounted yet (e.g. early interceptor fire)
  window.location.href = to;
}
