
/**
 * URL Shortener utility functions
 */

// Characters used for generating short URLs
const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// For local storage key
const STORAGE_KEY = 'tinyurl_shortened_links';

// Interface for storing URL data
export interface UrlData {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: number;
  clicks: number;
}

/**
 * Generate a random short code
 */
export const generateShortCode = (length: number = 6): string => {
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
export const createShortUrl = (originalUrl: string): UrlData => {
  // Generate a unique short code
  const shortCode = generateShortCode();
  
  // Create URL data object
  const urlData: UrlData = {
    id: crypto.randomUUID(),
    originalUrl,
    shortCode,
    createdAt: Date.now(),
    clicks: 0
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
  const baseUrl = window.location.origin;
  return `${baseUrl}/r/${shortCode}`;
};
