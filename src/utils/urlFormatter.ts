
/**
 * URL formatting utilities
 */
import { UrlData } from "@/types/url";

// Default production domain
const DEFAULT_PRODUCTION_DOMAIN = 'https://www.teenyweenyurl.xyz';

// Base URL for shortened links - ensure it's properly set for production
export const BASE_URL = (() => {
  // For local development environments
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return window.location.origin;
    }
    
    // For the Lovable preview environment
    if (window.location.hostname.includes('lovableproject.com')) {
      return window.location.origin;
    }
  }
  
  // For production - use the default or detect the current domain if it's custom
  return DEFAULT_PRODUCTION_DOMAIN;
})();

/**
 * Get the full shortened URL with base path
 */
export const getFullShortUrl = (shortCode: string, customDomain?: string): string => {
  if (customDomain) {
    return `${customDomain}/r/${shortCode}`;
  }
  return `${BASE_URL}/r/${shortCode}`;
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

/**
 * Check if a URL has expired
 */
export const hasUrlExpired = (urlData: UrlData): boolean => {
  return !!(urlData.expiresAt && Date.now() > urlData.expiresAt);
};
