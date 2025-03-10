
// Mock Firebase implementation using localStorage
console.log("Using localStorage instead of Firebase");

// Mock Firestore DB - just for compatibility with original API
export const db = {
  collection: () => "localStorage"
};

// No analytics in localStorage version
export const analytics = null;
