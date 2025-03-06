
// Mock Firebase implementation using localStorage
console.log("Using localStorage instead of Firebase");

// Mock Firestore DB
const db = {
  // This is just a reference object to maintain API compatibility
  collection: () => "localStorage"
};

// No analytics in localStorage version
const analytics = null;

// Export the mock services
export { db, analytics };
