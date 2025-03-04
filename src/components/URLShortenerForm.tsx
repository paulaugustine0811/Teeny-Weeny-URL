
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createShortUrl, getFullShortUrl, isValidUrl } from "@/utils/shortener";
import { motion } from "framer-motion";
import { CopyIcon, CheckIcon, ExternalLinkIcon } from "lucide-react";

const URLShortenerForm = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }
    
    // Add http:// prefix if not included
    let processedUrl = url;
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = `https://${processedUrl}`;
    }
    
    if (!isValidUrl(processedUrl)) {
      toast.error("Please enter a valid URL");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      try {
        const result = createShortUrl(processedUrl);
        const fullShortUrl = getFullShortUrl(result.shortCode);
        setShortUrl(fullShortUrl);
        toast.success("URL shortened successfully!");
      } catch (error) {
        toast.error("Failed to shorten URL");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };
  
  const copyToClipboard = () => {
    if (!shortUrl) return;
    
    navigator.clipboard.writeText(shortUrl)
      .then(() => {
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error("Failed to copy");
      });
  };
  
  const resetForm = () => {
    setUrl("");
    setShortUrl(null);
  };
  
  return (
    <div className="w-full max-w-xl mx-auto">
      {!shortUrl ? (
        <motion.form 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          onSubmit={handleSubmit} 
          className="space-y-4"
        >
          <div className="relative">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pr-24 h-14 text-base bg-white shadow-sm"
              placeholder="Enter your long URL"
              type="text"
            />
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="absolute right-1 top-1 h-12"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Shortening
                </div>
              ) : "Shorten URL"}
            </Button>
          </div>
        </motion.form>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="glass-card p-6 rounded-xl space-y-4"
        >
          <div className="flex flex-col space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Your shortened URL:</div>
            <div className="flex items-center">
              <div className="bg-secondary p-3 rounded-l-md border-y border-l border-border overflow-hidden overflow-ellipsis whitespace-nowrap flex-1">
                <a 
                  href={shortUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary font-medium hover:underline"
                >
                  {shortUrl}
                </a>
              </div>
              <Button 
                onClick={copyToClipboard} 
                size="icon" 
                variant="default" 
                className="rounded-l-none rounded-r-md h-[46px]"
              >
                {copied ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <CopyIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline" 
              className="flex-1"
              onClick={resetForm}
            >
              Shorten Another
            </Button>
            
            <Button 
              variant="default" 
              className="flex-1"
              onClick={() => {
                window.open(shortUrl, '_blank');
              }}
            >
              <ExternalLinkIcon className="mr-2 h-4 w-4" />
              Visit URL
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default URLShortenerForm;
