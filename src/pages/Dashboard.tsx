
import { useState, useEffect } from "react";
import { getSavedUrls, UrlData } from "@/utils/shortener";
import { getOverallAnalytics } from "@/utils/analytics";
import Navbar from "@/components/Navbar";
import LinkCard from "@/components/LinkCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart3Icon, LinkIcon, SearchIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = () => {
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [filteredUrls, setFilteredUrls] = useState<UrlData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "most-clicks">("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalUrls: 0,
    totalClicks: 0,
    averageClicksPerUrl: 0,
    topPerformers: [] as UrlData[]
  });
  
  useEffect(() => {
    // Load URLs from Firebase
    const loadData = async () => {
      setIsLoading(true);
      try {
        const savedUrls = await getSavedUrls();
        setUrls(savedUrls);
        setFilteredUrls(savedUrls);
        
        const stats = await getOverallAnalytics();
        setAnalytics(stats);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const handleDelete = (id: string) => {
    setUrls(urls.filter(url => url.id !== id));
    setFilteredUrls(filteredUrls.filter(url => url.id !== id));
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (!value.trim()) {
      setFilteredUrls(urls);
      return;
    }
    
    const filtered = urls.filter(url => 
      url.originalUrl.toLowerCase().includes(value.toLowerCase()) || 
      url.shortCode.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUrls(filtered);
  };
  
  const handleSort = (order: "newest" | "oldest" | "most-clicks") => {
    setSortOrder(order);
    
    let sorted = [...filteredUrls];
    
    switch (order) {
      case "newest":
        sorted = sorted.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case "oldest":
        sorted = sorted.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case "most-clicks":
        sorted = sorted.sort((a, b) => b.clicks - a.clicks);
        break;
    }
    
    setFilteredUrls(sorted);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 md:px-6 pt-28 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-6 rounded-xl md:col-span-3"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Manage and track your shortened URLs</p>
              </div>
              <Link to="/">
                <Button>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Create New URL
                </Button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="glass-card p-6 rounded-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total URLs</h3>
              <LinkIcon className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-bold">{analytics.totalUrls}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="glass-card p-6 rounded-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Clicks</h3>
              <BarChart3Icon className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-bold">{analytics.totalClicks}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="glass-card p-6 rounded-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Average Clicks</h3>
              <BarChart3Icon className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-bold">{analytics.averageClicksPerUrl.toFixed(1)}</p>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="glass-card p-6 rounded-xl mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={handleSearch}
                className="pl-9"
                placeholder="Search URLs..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={sortOrder === "newest" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSort("newest")}
              >
                Newest
              </Button>
              <Button
                variant={sortOrder === "oldest" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSort("oldest")}
              >
                Oldest
              </Button>
              <Button
                variant={sortOrder === "most-clicks" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSort("most-clicks")}
              >
                Most Clicks
              </Button>
            </div>
          </div>
        </motion.div>
        
        {filteredUrls.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-8 rounded-xl text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <LinkIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No URLs found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm 
                ? "No URLs match your search criteria" 
                : "You haven't created any shortened URLs yet"}
            </p>
            <Link to="/">
              <Button>
                Create Your First URL
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredUrls.map(url => (
                <LinkCard
                  key={url.id}
                  urlData={url}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
