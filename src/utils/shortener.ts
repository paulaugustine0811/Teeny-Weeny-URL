
/**
 * URL Shortener main API
 */
import { db } from "@/lib/firebase";
import { UrlData } from "@/types/url";
import { generateShortCode } from "@/utils/codeGenerator";
import { isValidUrl, isValidCustomCode, isValidDomain } from "@/utils/urlValidation";
import { BASE_URL, getFullShortUrl, formatExpiration, hasUrlExpired } from "@/utils/urlFormatter";
import {
  saveUrl,
  getSavedUrls,
  getUrlByShortCode,
  deleteUrl,
  trackUrlClick,
  isCustomCodeAvailable,
  purgeExpiredUrls
} from "@/services/urlService";

console.log("Shortener initialized with BASE_URL:", BASE_URL);
console.log("Using localStorage for data storage");

// Re-export useful utilities and types
export { 
  UrlData,
  BASE_URL, 
  getFullShortUrl, 
  formatExpiration, 
  hasUrlExpired,
  isValidUrl,
  isValidCustomCode,
  isValidDomain
};

/**
 * Create a new shortened URL
 */
export const createShortUrl = async (originalUrl: string, options?: { 
  customCode?: string, 
  expiresAt?: number | null,
  customDomain?: string
}): Promise<UrlData> => {
  console.log("Creating short URL for:", originalUrl, "with options:", options);
  
  // Validate URL
  if (!isValidUrl(originalUrl)) {
    console.error("Invalid URL format:", originalUrl);
    throw new Error("Please enter a valid URL");
  }
  
  // Use custom code if provided and valid, otherwise generate one
  let shortCode: string;
  const useCustomCode = !!(options?.customCode && isValidCustomCode(options.customCode));
  
  if (useCustomCode) {
    try {
      console.log("Checking availability of custom code:", options!.customCode);
      const codeAvailable = await isCustomCodeAvailable(options!.customCode!);
      if (!codeAvailable) {
        throw new Error("Custom code is already in use");
      }
      shortCode = options!.customCode!;
    } catch (error) {
      console.error("Error checking custom code availability:", error);
      throw new Error("Failed to check if custom code is available");
    }
  } else {
    // Generate a unique shortcode
    let isUnique = false;
    let attempts = 0;
    try {
      do {
        shortCode = generateShortCode();
        console.log("Generated code:", shortCode, "Attempt:", attempts + 1);
        // eslint-disable-next-line no-await-in-loop
        isUnique = await isCustomCodeAvailable(shortCode);
        attempts++;
        // Increase length if we have too many collisions
        if (attempts > 3 && !isUnique) {
          shortCode = generateShortCode(5);
          console.log("Increased code length to 5:", shortCode);
          // eslint-disable-next-line no-await-in-loop
          isUnique = await isCustomCodeAvailable(shortCode);
        }
      } while (!isUnique && attempts < 5);
      
      if (!isUnique) {
        throw new Error("Failed to generate a unique code, please try again");
      }
    } catch (error) {
      console.error("Error generating unique code:", error);
      throw new Error("Failed to generate a unique code");
    }
  }
  
  console.log("Using short code:", shortCode);
  
  // Validate custom domain if provided
  let customDomain = options?.customDomain?.trim();
  if (customDomain === '') {
    customDomain = undefined;
  }
  
  if (customDomain) {
    if (!isValidDomain(customDomain)) {
      throw new Error("Please enter a valid domain name");
    }
    
    // Ensure domain has https:// prefix
    if (!customDomain.startsWith('http://') && !customDomain.startsWith('https://')) {
      customDomain = `https://${customDomain}`;
    }
  }
  
  // Create URL data object
  const urlData: Omit<UrlData, 'id'> = {
    originalUrl,
    shortCode,
    createdAt: Date.now(),
    clicks: 0,
    expiresAt: options?.expiresAt || null,
    customCode: !!useCustomCode,
  };
  
  // Only add customDomain if it's a non-empty string
  if (customDomain) {
    urlData.customDomain = customDomain;
  }
  
  // Log the urlData to be saved
  console.log("URL data to be saved:", JSON.stringify(urlData));
  
  try {
    // Save to localStorage
    return await saveUrl(urlData);
  } catch (error) {
    console.error("Failed to save URL:", error);
    if (error instanceof Error) {
      throw error; // Re-throw the specific error
    }
    throw new Error("Failed to save shortened URL");
  }
};

// Re-export other functions from service
export {
  getSavedUrls,
  getUrlByShortCode,
  deleteUrl,
  trackUrlClick,
  purgeExpiredUrls
};
