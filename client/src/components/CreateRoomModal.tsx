import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Eye, Clock, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (room: { title: string; tags: string[] }) => void;
}

const suggestedTags = ["Chill", "Music", "Sports", "Gaming", "Food", "Tech", "Random", "Meetup"];

const CreateRoomModal = ({ isOpen, onClose, onCreate }: CreateRoomModalProps) => {
  const [title, setTitle] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleCreate = () => {
    if (title.trim()) {
      onCreate({ title: title.trim(), tags: selectedTags });
      setTitle("");
      setSelectedTags([]);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6 pb-8 shadow-elevated max-h-[85vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Create Room</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Room Title Input */}
            <div className="mb-6">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Room Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's the vibe?"
                className="h-14 text-lg rounded-xl border-2 border-border focus:border-primary"
                maxLength={50}
              />
              <span className="text-xs text-muted-foreground mt-1 block text-right">
                {title.length}/50
              </span>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <label className="text-sm font-medium text-muted-foreground mb-3 block">
                Tags (up to 3)
              </label>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedTags.includes(tag)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Room Details Checklist */}
            <div className="bg-secondary/50 rounded-2xl p-4 mb-8">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Room Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm text-foreground flex-1">Location Ready</span>
                  <Check className="w-5 h-5 text-accent" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm text-foreground flex-1">5km Visibility</span>
                  <Check className="w-5 h-5 text-accent" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm text-foreground flex-1">2-hour expiry</span>
                  <Check className="w-5 h-5 text-accent" />
                </div>
              </div>
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreate}
              disabled={!title.trim()}
              className="w-full"
              size="lg"
            >
              Create Room
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateRoomModal;
