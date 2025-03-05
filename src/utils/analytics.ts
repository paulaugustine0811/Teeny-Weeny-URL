
import { UrlData, getSavedUrls } from "./shortener";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";

/**
 * Get overall analytics for all URLs
 */
export const getOverallAnalytics = async () => {
  const urls = await getSavedUrls();
  
  return {
    totalUrls: urls.length,
    totalClicks: urls.reduce((sum, url) => sum + url.clicks, 0),
    averageClicksPerUrl: urls.length ? 
      urls.reduce((sum, url) => sum + url.clicks, 0) / urls.length : 
      0,
    topPerformers: [...urls]
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)
  };
};

/**
 * Get the most clicked URLs in the last 7 days
 */
export const getRecentTopPerformers = async (days = 7) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffTimestamp = cutoffDate.getTime();
  
  const urls = await getSavedUrls();
  return urls
    .filter(url => url.createdAt >= cutoffTimestamp)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);
};

/**
 * Format a timestamp into a readable date string
 */
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calculate time ago string from timestamp
 */
export const timeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? `${interval} year ago` : `${interval} years ago`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? `${interval} month ago` : `${interval} months ago`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? `${interval} day ago` : `${interval} days ago`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? `${interval} hour ago` : `${interval} hours ago`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? `${interval} minute ago` : `${interval} minutes ago`;
  }
  
  return seconds <= 10 ? 'just now' : `${seconds} seconds ago`;
};
