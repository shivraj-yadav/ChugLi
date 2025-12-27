import { motion } from "framer-motion";
import { MapPin, Users, Clock, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RoomCardProps {
  id: string;
  title: string;
  distance: number;
  memberCount: number;
  expiresIn: number; // minutes
  tags: string[];
  isLive?: boolean;
  onDelete?: (id: string) => void;
}

const RoomCard = ({
  id,
  title,
  distance,
  memberCount,
  expiresIn,
  tags,
  isLive = true,
  onDelete,
}: RoomCardProps) => {
  const navigate = useNavigate();

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/room/${id}`)}
      className="card-elevated cursor-pointer rounded-2xl p-5 bg-card border border-border/50 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-lg text-foreground line-clamp-2 flex-1 pr-2">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
              className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              aria-label="Delete room"
              title="Delete room"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </button>
          )}
          {isLive && (
            <div className="flex items-center gap-1.5 bg-accent/10 text-accent px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-accent pulse-live" />
              <span className="text-xs font-semibold">LIVE</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin size={14} />
          <span className="text-sm font-medium">{distance} km</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={14} />
          <span className="text-sm font-medium">{memberCount}</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <Clock size={14} />
          <span className="text-sm font-medium">{formatTime(expiresIn)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default RoomCard;
