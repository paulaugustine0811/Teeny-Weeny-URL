import { useState } from "react";
import { UrlData, deleteUrl, getFullShortUrl, formatExpiration, hasUrlExpired } from "@/utils/shortener";
import { timeAgo } from "@/utils/analytics";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CopyIcon, CheckIcon, TrashIcon, ExternalLinkIcon, ChartBarIcon, ClockIcon } from "lucide-react";
import { motion } from "framer-motion";

interface LinkCardProps {
  urlData: UrlData;
  onDelete: (id: string) => void;
}

const LinkCard = ({ urlData, onDelete }: LinkCardProps) => {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const shortUrl = getFullShortUrl(urlData.shortCode);
  const isExpired = hasUrlExpired(urlData);
  
  const copyToClipboard = () => {
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
  
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this URL?")) {
      setIsDeleting(true);
      try {
        await deleteUrl(urlData.id);
        onDelete(urlData.id);
        toast.success("URL deleted successfully!");
      } catch (error) {
        console.error("Error deleting URL:", error);
        toast.error("Failed to delete URL");
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className={`glass-card rounded-xl p-5 space-y-4 transition-all duration-200 hover:shadow-md ${isExpired ? 'opacity-60' : ''}`}
    >
      <div className="space-y-1">
        <div className="flex justify-between items-start">
          <p className="text-xs font-medium text-muted-foreground">
            Created {timeAgo(urlData.createdAt)}
          </p>
          
          {urlData.expiresAt && (
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <ClockIcon className="h-3 w-3" />
              <span className={isExpired ? "text-destructive" : ""}>
                {isExpired ? "Expired" : `Expires in ${formatExpiration(urlData.expiresAt)}`}
              </span>
            </div>
          )}
        </div>
        
        <h3 className="font-medium text-sm text-card-foreground truncate" title={urlData.originalUrl}>
          {urlData.originalUrl}
        </h3>
      </div>
      
      <div className="flex items-center gap-2 bg-secondary/50 border rounded-lg p-2 pl-3">
        <div className="truncate flex-1">
          <a 
            href={shortUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary text-sm font-medium hover:underline"
          >
            {shortUrl}
          </a>
        </div>
        <Button 
          onClick={copyToClipboard} 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 btn-hover-effect"
        >
          {copied ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            <CopyIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-slow"></div>
          <span className="text-sm font-medium">{urlData.clicks} clicks</span>
        </div>
        
        <div className="flex items-center gap-2">
          {urlData.customCode && (
            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
              Custom
            </span>
          )}
          <Button
            onClick={() => window.open(shortUrl, '_blank')}
            size="icon"
            variant="ghost"
            className="h-8 w-8 btn-hover-effect"
            disabled={isExpired}
          >
            <ExternalLinkIcon className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleDelete}
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive btn-hover-effect"
            disabled={isDeleting}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default LinkCard;
