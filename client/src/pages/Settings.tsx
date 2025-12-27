import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, LogOut, User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockUserHandle } from "@/data/mockData";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const [handle, setHandle] = useState(localStorage.getItem("chugli_handle") || mockUserHandle);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateNewHandle = () => {
    setIsGenerating(true);
    const adjectives = [
      "Silver",
      "Golden",
      "Mystic",
      "Neon",
      "Crimson",
      "Azure",
      "Cosmic",
      "Velvet",
    ];
    const nouns = [
      "Phoenix",
      "Dragon",
      "Wolf",
      "Eagle",
      "Panda",
      "Tiger",
      "Owl",
      "Fox",
    ];
    const numbers = Math.floor(Math.random() * 99) + 1;
    const newHandle = `@${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${numbers}`;

    setTimeout(() => {
      setHandle(newHandle);
      setIsGenerating(false);
      toast.success("Handle updated successfully!");
    }, 500);
  };

  const handleSignOut = () => {
    localStorage.removeItem("chugli_token");
    localStorage.removeItem("chugli_handle");
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border"
      >
        <div className="flex items-center gap-4 px-4 py-4">
          <button
            onClick={() => navigate("/home")}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
        </div>
      </motion.header>

      <div className="p-5 space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elevated bg-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Anonymous Profile
              </h2>
              <p className="text-sm text-muted-foreground">
                Your identity is protected
              </p>
            </div>
          </div>

          {/* Handle Display */}
          <div className="bg-secondary/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Your Handle
                </p>
                <p className="text-lg font-bold text-foreground">{handle}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={generateNewHandle}
                disabled={isGenerating}
              >
                <RefreshCw
                  className={`w-5 h-5 ${isGenerating ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-elevated bg-card rounded-2xl overflow-hidden"
        >
          <button
            onClick={generateNewHandle}
            className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-accent" />
              </div>
              <span className="font-medium text-foreground">Change Handle</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="h-px bg-border" />

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-destructive" />
              </div>
              <span className="font-medium text-destructive">Sign Out</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <p className="text-xs text-muted-foreground">
            ChugLi v1.0 • Made with ❤️
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Your conversations expire after 2 hours
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
