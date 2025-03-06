/**
 * URL Shortener utility functions
 */
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  updateDoc, 
  getDoc,
  orderBy,
  limit 
} from "firebase/firestore";

// Characters used for generating short URLs
const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// Collection name for Firestore
const COLLECTION_NAME = 'shortened_links';

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

console.log("Shortener initialized with BASE_URL:", BASE_URL);

// Interface for storing URL data
export interface UrlData {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: number;
  clicks: number;
  expiresAt: number | null;
  customCode: boolean;
  customDomain?: string; // New field for custom domain
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

/**
 * Check if a custom code is already in use
 */
export const isCustomCodeAvailable = async (code: string): Promise<boolean> => {
  try {
    const urlsRef = collection(db, COLLECTION_NAME);
    const q = query(urlsRef, where("shortCode", "==", code));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  } catch (error) {
    console.error("Error checking custom code availability:", error);
    throw new Error("Failed to check if code is available");
  }
};

/**
 * Save URL data to Firestore
 */
export const saveUrl = async (urlData: Omit<UrlData, 'id'>): Promise<UrlData> => {
  try {
    console.log("Attempting to save URL to Firestore:", JSON.stringify(urlData));
    
    // Validate the database connection is available
    if (!db) {
      console.error("Firebase database instance is not available");
      throw new Error("Database connection failed");
    }
    
    // Check if the URL is valid before saving
    if (!isValidUrl(urlData.originalUrl)) {
      console.error("Invalid URL format:", urlData.originalUrl);
      throw new Error("Invalid URL format");
    }
    
    // Ensure there's a valid shortCode
    if (!urlData.shortCode) {
      console.error("Missing shortCode in URL data");
      throw new Error("Missing shortCode in URL data");
    }
    
    console.log("Using Firestore instance:", db ? "DB initialized" : "DB not initialized");
    
    // Create a clean object to store in Firestore
    // Remove any undefined values which Firestore doesn't accept
    const cleanUrlData = Object.fromEntries(
      Object.entries(urlData).filter(([_, value]) => value !== undefined)
    );
    
    console.log("Cleaned URL data for Firestore:", cleanUrlData);
    
    const urlsRef = collection(db, COLLECTION_NAME);
    
    // Attempt to add document with clean data
    console.log("Adding document to collection:", COLLECTION_NAME);
    const docRef = await addDoc(urlsRef, cleanUrlData);
    
    console.log("URL saved successfully with ID:", docRef.id);
    return { ...urlData, id: docRef.id };
  } catch (error) {
    console.error("Error saving URL to Firestore:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("permission-denied")) {
        throw new Error("Permission denied: Cannot write to database");
      } else if (error.message.includes("unavailable")) {
        throw new Error("Database service is currently unavailable");
      } else if (error.message.includes("not-found")) {
        throw new Error("Collection not found");
      }
      throw new Error(`Failed to save shortened URL: ${error.message}`);
    }
    
    throw new Error("Failed to save shortened URL");
  }
};

/**
 * Get all saved URLs from Firestore
 */
export const getSavedUrls = async (): Promise<UrlData[]> => {
  const urlsRef = collection(db, COLLECTION_NAME);
  const q = query(urlsRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as UrlData));
};

/**
 * Get a specific URL by short code
 */
export const getUrlByShortCode = async (shortCode: string): Promise<UrlData | null> => {
  console.log("Looking up URL with shortCode:", shortCode);
  
  try {
    const urlsRef = collection(db, COLLECTION_NAME);
    const q = query(urlsRef, where("shortCode", "==", shortCode));
    const querySnapshot = await getDocs(q);
    
    console.log("Query result size:", querySnapshot.size);
    
    if (querySnapshot.empty) {
      console.log("No matching URL found for shortCode:", shortCode);
      return null;
    }
    
    const docData = querySnapshot.docs[0];
    const urlData = {
      id: docData.id,
      ...docData.data()
    } as UrlData;
    
    console.log("Found URL data:", urlData);
    return urlData;
  } catch (error) {
    console.error("Error fetching URL by shortCode:", error);
    return null;
  }
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
    // Save to Firestore
    return await saveUrl(urlData);
  } catch (error) {
    console.error("Failed to save URL:", error);
    if (error instanceof Error) {
      throw error; // Re-throw the specific error
    }
    throw new Error("Failed to save shortened URL");
  }
};

/**
 * Delete a URL by ID
 */
export const deleteUrl = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};

/**
 * Track click for a URL
 */
export const trackUrlClick = async (shortCode: string): Promise<UrlData | null> => {
  console.log("Tracking click for shortCode:", shortCode);
  const urlData = await getUrlByShortCode(shortCode);
  
  if (!urlData) {
    console.log("No URL found to track click for shortCode:", shortCode);
    return null;
  }
  
  // Check if URL has expired
  if (urlData.expiresAt && Date.now() > urlData.expiresAt) {
    console.log("URL has expired, removing it. shortCode:", shortCode);
    // URL has expired, remove it
    await deleteUrl(urlData.id);
    return null;
  }
  
  try {
    // Increment click count
    const docRef = doc(db, COLLECTION_NAME, urlData.id);
    await updateDoc(docRef, {
      clicks: urlData.clicks + 1
    });
    
    console.log("Click tracked successfully for shortCode:", shortCode);
    return {
      ...urlData,
      clicks: urlData.clicks + 1
    };
  } catch (error) {
    console.error("Error tracking click:", error);
    // Return the original URL data even if tracking fails
    return urlData;
  }
};

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
 * Check if a URL has expired
 */
export const hasUrlExpired = (urlData: UrlData): boolean => {
  return !!(urlData.expiresAt && Date.now() > urlData.expiresAt);
};

/**
 * Purge all expired URLs from storage
 */
export const purgeExpiredUrls = async (): Promise<number> => {
  const urlsRef = collection(db, COLLECTION_NAME);
  const now = Date.now();
  const q = query(urlsRef, where("expiresAt", "<=", now), where("expiresAt", "!=", null));
  const querySnapshot = await getDocs(q);
  
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
  
  return querySnapshot.size;
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
