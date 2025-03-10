
/**
 * Interface for storing URL data
 */
export interface UrlData {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: number;
  clicks: number;
  expiresAt: number | null;
  customCode: boolean;
  customDomain?: string; // Field for custom domain
}
