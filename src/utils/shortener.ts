
/**
 * URL Shortener utility functions
 */

// Characters used for generating short URLs
const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// For local storage key
const STORAGE_KEY = 'teenyweeny_shortened_links';

// Base URL for shortened links
export const BASE_URL = 'https://teenyweenyurl.xyz';

// Interface for storing URL data
export interface UrlData {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: number;
  clicks: number;
  expiresAt: number | null;
  customCode: boolean;
}

/**
 * Generate a random short code
 */
export const generateShortCode = (length: number = 4): string => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }
  return result;
};

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
 * Check if a custom code is valid (alphanumeric only)
 */
export const isValidCustomCode = (code: string): boolean => {
  return /^[a-zA-Z0-9-_]+$/.test(code);
};

/**
 * Check if a custom code is already in use
 */
export const isCustomCodeAvailable = (code: string): boolean => {
  const urls = getSavedUrls();
  return !urls.some(url => url.shortCode === code);
};

/**
 * Save URL data to local storage
 */
export const saveUrl = (urlData: UrlData): void => {
  const existingData = getSavedUrls();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([urlData, ...existingData]));
};

/**
 * Get all saved URLs from local storage
 */
export const getSavedUrls = (): UrlData[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

/**
 * Get a specific URL by short code
 */
export const getUrlByShortCode = (shortCode: string): UrlData | null => {
  const urls = getSavedUrls();
  return urls.find(url => url.shortCode === shortCode) || null;
};

/**
 * Create a new shortened URL
 */
export const createShortUrl = (originalUrl: string, options?: { 
  customCode?: string, 
  expiresAt?: number | null 
}): UrlData => {
  // Use custom code if provided and valid, otherwise generate one
  const useCustomCode = !!(options?.customCode && isValidCustomCode(options.customCode));
  
  if (useCustomCode && !isCustomCodeAvailable(options!.customCode!)) {
    throw new Error("Custom code is already in use");
  }
  
  const shortCode = useCustomCode ? options!.customCode! : generateShortCode();
  
  // Create URL data object
  const urlData: UrlData = {
    id: crypto.randomUUID(),
    originalUrl,
    shortCode,
    createdAt: Date.now(),
    clicks: 0,
    expiresAt: options?.expiresAt || null,
    customCode: !!useCustomCode
  };
  
  // Save to storage
  saveUrl(urlData);
  
  return urlData;
};

/**
 * Delete a URL by ID
 */
export const deleteUrl = (id: string): void => {
  const urls = getSavedUrls();
  const filteredUrls = urls.filter(url => url.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredUrls));
};

/**
 * Track click for a URL
 */
export const trackUrlClick = (shortCode: string): UrlData | null => {
  const urls = getSavedUrls();
  const urlIndex = urls.findIndex(url => url.shortCode === shortCode);
  
  if (urlIndex === -1) return null;
  
  // Check if URL has expired
  if (urls[urlIndex].expiresAt && Date.now() > urls[urlIndex].expiresAt) {
    // URL has expired, remove it
    urls.splice(urlIndex, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
    return null;
  }
  
  // Increment click count
  urls[urlIndex].clicks += 1;
  
  // Save updated data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
  
  return urls[urlIndex];
};

/**
 * Get the full shortened URL with base path
 */
export const getFullShortUrl = (shortCode: string): string => {
  return `${BASE_URL}/r/${shortCode}`;
};

/**
 * Check if a URL has expired
 */
export const hasUrlExpired = (urlData: UrlData): boolean => {
  return !!(urlData.expiresAt && Date.now() > urlData.expiresAt);
};

/**
 * Purge all expired URLs from storage
 */
export const purgeExpiredUrls = (): number => {
  const urls = getSavedUrls();
  const now = Date.now();
  
  const validUrls = urls.filter(url => !url.expiresAt || url.expiresAt > now);
  const removedCount = urls.length - validUrls.length;
  
  if (removedCount > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validUrls));
  }
  
  return removedCount;
};

/**
 * Format expiration date for display
 */
export const formatExpiration = (expiresAt: number | null): string => {
  if (!expiresAt) return 'Never';
  
  const now = Date.now();
  if (now > expiresAt) return 'Expired';
  
  const diff = expiresAt - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  const minutes = Math.floor(diff / (1000 * 60));
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
};
