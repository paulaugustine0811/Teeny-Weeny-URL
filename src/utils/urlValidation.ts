
/**
 * URL validation utilities
 */

/**
 * Validate a URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Validate a domain name
 */
export const isValidDomain = (domain: string): boolean => {
  // Basic domain validation
  return /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(domain);
};

/**
 * Check if a custom code is valid (alphanumeric only)
 */
export const isValidCustomCode = (code: string): boolean => {
  return /^[a-zA-Z0-9-_]+$/.test(code);
};
