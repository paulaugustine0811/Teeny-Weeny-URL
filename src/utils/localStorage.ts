
// Local storage utility for URL shortener
import { UrlData } from "@/types/url";

const STORAGE_KEY = 'teenyweeny_urls';

// Initialize localStorage if not already set
const initializeStorage = (): void => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
};

// Get all items from localStorage
export const getAllItems = (): UrlData[] => {
  initializeStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

// Save all items to localStorage
const saveAllItems = (items: UrlData[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

// Add an item to localStorage
export const addItem = (item: Omit<UrlData, 'id'>): string => {
  const items = getAllItems();
  const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const newItem = { ...item, id } as UrlData;
  items.push(newItem);
  saveAllItems(items);
  return id;
};

// Update an item in localStorage
export const updateItem = (id: string, updates: Partial<UrlData>): boolean => {
  const items = getAllItems();
  const index = items.findIndex(item => item.id === id);
  
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    saveAllItems(items);
    return true;
  }
  return false;
};

// Delete an item from localStorage
export const deleteItem = (id: string): boolean => {
  const items = getAllItems();
  const filteredItems = items.filter(item => item.id !== id);
  
  if (filteredItems.length !== items.length) {
    saveAllItems(filteredItems);
    return true;
  }
  return false;
};

// Find items by a property value
export const findItemsByProperty = <T extends keyof UrlData>(property: T, value: UrlData[T]): UrlData[] => {
  const items = getAllItems();
  return items.filter(item => item[property] === value);
};

// Clear all data
export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  initializeStorage();
};
