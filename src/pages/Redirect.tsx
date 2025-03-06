
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUrlByShortCode, trackUrlClick, hasUrlExpired } from "@/utils/shortener";
import { motion } from "framer-motion";
import { toast } from "sonner";

const Redirect = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  
  useEffect(() => {
    if (!shortCode) {
      console.error("No shortCode provided in URL params");
      navigate("/");
      return;
    }
    
    console.log("Redirect component mounted with shortCode:", shortCode);
    
    const fetchAndRedirect = async () => {
      try {
        console.log("Fetching URL data for shortCode:", shortCode);
        const urlData = await getUrlByShortCode(shortCode);
        
        if (!urlData) {
          console.error("URL not found for shortCode:", shortCode);
          setError("URL not found");
          setIsLoading(false);
          toast.error("The shortened URL you're trying to access doesn't exist");
          return;
        }
        
        console.log("URL data found:", urlData);
        
        // Check if URL is expired
        if (hasUrlExpired(urlData)) {
          console.log("URL has expired:", urlData);
          setIsExpired(true);
          setIsLoading(false);
          toast.error("This link has expired");
          return;
        }
        
        // Track the click
        console.log("Tracking click for shortCode:", shortCode);
        await trackUrlClick(shortCode);
        
        // Validate the original URL
        let targetUrl = urlData.originalUrl;
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
          console.log("URL doesn't have protocol, adding https://", targetUrl);
          targetUrl = 'https://' + targetUrl;
        }
        
        console.log("Redirecting to:", targetUrl);
        
        // Add a small delay to show loading animation
        setTimeout(() => {
          // Redirect to the original URL
          window.location.href = targetUrl;
        }, 800);
      } catch (error) {
        console.error("Error in redirect:", error);
        setError("Failed to process the URL");
        setIsLoading(false);
        toast.error("An error occurred while processing your request");
      }
    };
    
    fetchAndRedirect();
  }, [shortCode, navigate]);
  
  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-8 rounded-xl text-center max-w-md"
        >
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-amber-500/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-500"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Link Expired</h2>
          <p className="text-muted-foreground mb-6">
            The shortened URL you're trying to access has expired and is no longer available.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 btn-hover-effect"
          >
            Go to Homepage
          </a>
        </motion.div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-8 rounded-xl text-center max-w-md"
        >
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-destructive/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-destructive"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Link Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The shortened URL you're trying to access doesn't exist or has been removed.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 btn-hover-effect"
          >
            Go to Homepage
          </a>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="glass-card p-8 rounded-xl text-center max-w-md"
      >
        <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center loading-ring">
          <svg
            className="animate-spin h-8 w-8 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">Redirecting you</h2>
        <p className="text-muted-foreground">Please wait a moment...</p>
      </motion.div>
    </div>
  );
};

export default Redirect;
