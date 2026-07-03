/**
 * Check if the current page is running inside an iframe.
 * Handles cross-origin cases where accessing window.top throws.
 */
export function isIframed(): boolean {
  try {
    return window.self !== window.top
  } catch {
    return true
  }
}
