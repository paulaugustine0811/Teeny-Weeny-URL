
/**
 * URL database service
 */
import { UrlData } from "@/types/url";
import { generateShortCode } from "@/utils/codeGenerator";
import { 
  addItem,
  updateItem,
  deleteItem,
  getAllItems,
  findItemsByProperty
} from "@/utils/localStorage";
import { isValidCustomCode } from "@/utils/urlValidation";

/**
 * Check if a custom code is already in use
 */
export const isCustomCodeAvailable = async (code: string): Promise<boolean> => {
  try {
    const existingUrls = findItemsByProperty('shortCode', code);
    return existingUrls.length === 0;
  } catch (error) {
    console.error("Error checking custom code availability:", error);
    throw new Error("Failed to check if code is available");
  }
};

/**
 * Save URL data to localStorage
 */
export const saveUrl = async (urlData: Omit<UrlData, 'id'>): Promise<UrlData> => {
  try {
    console.log("Attempting to save URL to localStorage:", JSON.stringify(urlData));
    
    // Create a clean object to store in localStorage
    // Remove any undefined values
    const cleanUrlData = Object.fromEntries(
      Object.entries(urlData).filter(([_, value]) => value !== undefined)
    );
    
    console.log("Cleaned URL data for localStorage:", cleanUrlData);
    
    // Add to localStorage and get ID
    const id = addItem(cleanUrlData);
    
    console.log("URL saved successfully with ID:", id);
    return { ...urlData, id };
  } catch (error) {
    console.error("Error saving URL to localStorage:", error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error("Failed to save shortened URL");
  }
};

/**
 * Get all saved URLs from localStorage
 */
export const getSavedUrls = async (): Promise<UrlData[]> => {
  return getAllItems() as UrlData[];
};

/**
 * Get a specific URL by short code
 */
export const getUrlByShortCode = async (shortCode: string): Promise<UrlData | null> => {
  console.log("Looking up URL with shortCode:", shortCode);
  
  try {
    const matchingUrls = findItemsByProperty('shortCode', shortCode);
    
    console.log("Query result size:", matchingUrls.length);
    
    if (matchingUrls.length === 0) {
      console.log("No matching URL found for shortCode:", shortCode);
      return null;
    }
    
    const urlData = matchingUrls[0] as UrlData;
    
    console.log("Found URL data:", urlData);
    return urlData;
  } catch (error) {
    console.error("Error fetching URL by shortCode:", error);
    return null;
  }
};

/**
 * Delete a URL by ID
 */
export const deleteUrl = async (id: string): Promise<void> => {
  deleteItem(id);
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
    const newClickCount = urlData.clicks + 1;
    updateItem(urlData.id, { clicks: newClickCount });
    
    console.log("Click tracked successfully for shortCode:", shortCode);
    return {
      ...urlData,
      clicks: newClickCount
    };
  } catch (error) {
    console.error("Error tracking click:", error);
    // Return the original URL data even if tracking fails
    return urlData;
  }
};

/**
 * Purge all expired URLs from storage
 */
export const purgeExpiredUrls = async (): Promise<number> => {
  const allUrls = getAllItems() as UrlData[];
  const now = Date.now();
  
  let deletedCount = 0;
  allUrls.forEach(url => {
    if (url.expiresAt && url.expiresAt <= now) {
      deleteItem(url.id);
      deletedCount++;
    }
  });
  
  return deletedCount;
};
